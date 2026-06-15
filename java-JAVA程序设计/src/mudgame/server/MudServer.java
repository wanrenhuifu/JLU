package mudgame.server;

import mudgame.model.NPC;
import mudgame.model.Player;
import mudgame.model.Room;
import mudgame.util.PlayerDB;

import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.List;
import java.util.Map;
import java.util.concurrent.*;

/**
 * MUD 游戏服务器主类。监听客户端连接，管理游戏世界和玩家。
 *
 * 用法: java mudgame.server.MudServer [port]
 * 默认端口: 8888
 */
public class MudServer {

    private static final int DEFAULT_PORT = 8888;
    private static final String DATA_DIR = "data";
    private static final String PLAYER_FILE = DATA_DIR + "/players.dat";

    private final int port;
    private final GameWorld world;
    private final PlayerDB playerDB;
    private final Map<String, ClientHandler> handlers = new ConcurrentHashMap<>();
    private final ScheduledExecutorService npcScheduler = Executors.newSingleThreadScheduledExecutor();
    private ServerSocket serverSocket;
    private volatile boolean running = true;

    public MudServer(int port) {
        this.port = port;
        this.world = new GameWorld();
        this.playerDB = new PlayerDB(PLAYER_FILE);
    }

    public void start() throws IOException {
        // 初始化数据目录
        new File(DATA_DIR).mkdirs();

        // 初始化世界
        world.init();
        System.out.println("[MudServer] 游戏世界已初始化: " + world.getRooms().size() + " 个房间");

        // 加载玩家数据
        playerDB.loadAll(world.getKungFuMap());
        System.out.println("[MudServer] 玩家数据已加载");

        // 启动 NPC 随机走动
        startNpcWalker();

        // 启动服务器
        serverSocket = new ServerSocket(port);
        System.out.println("[MudServer] 服务器已启动，监听端口 " + port);

        while (running) {
            try {
                Socket socket = serverSocket.accept();
                handleNewConnection(socket);
            } catch (IOException e) {
                if (running) {
                    System.err.println("[MudServer] 接受连接失败: " + e.getMessage());
                }
            }
        }
    }

    private void handleNewConnection(Socket socket) {
        new Thread(() -> {
            try {
                BufferedReader in = new BufferedReader(
                    new InputStreamReader(socket.getInputStream(), "UTF-8"));
                PrintWriter out = new PrintWriter(
                    new OutputStreamWriter(socket.getOutputStream(), "UTF-8"), true);

                // 登录/注册
                out.println("欢迎来到 MUD 世界！");
                out.println("请输入用户名（新用户将自动注册）：");
                String name = in.readLine();
                if (name == null || name.trim().isEmpty()) {
                    socket.close();
                    return;
                }
                name = name.trim();

                // 检查是否已在线
                if (handlers.containsKey(name)) {
                    out.println("该用户已在其他位置登录。");
                    socket.close();
                    return;
                }

                out.println("请输入密码：");
                String password = in.readLine();
                if (password == null || password.trim().isEmpty()) {
                    socket.close();
                    return;
                }
                password = password.trim();

                Player player = playerDB.get(name);
                if (player == null) {
                    // 新用户注册
                    player = playerDB.create(name, password);
                    out.println("✅ 账户创建成功！欢迎，" + name + "！");
                } else {
                    // 验证密码
                    if (!player.getPassword().equals(password)) {
                        out.println("❌ 密码错误。");
                        socket.close();
                        return;
                    }
                    out.println("✅ 登录成功！欢迎回来，" + name + "！");
                }

                // 进入游戏
                player.setOnline(true);
                world.addPlayer(player);

                ClientHandler handler = new ClientHandler(socket, world, player, playerDB, handlers);
                handlers.put(name, handler);
                handler.start();

            } catch (IOException e) {
                System.err.println("[MudServer] 登录处理失败: " + e.getMessage());
                try { socket.close(); } catch (IOException ignored) {}
            }
        }).start();
    }

    /** NPC 随机走动定时器 */
    private void startNpcWalker() {
        npcScheduler.scheduleAtFixedRate(() -> {
            try {
                for (Map.Entry<String, NPC> entry : world.getNpcs().entrySet()) {
                    NPC npc = entry.getValue();
                    List<String> neighbors = world.getNeighborRooms(npc.getCurrentRoom());
                    if (!neighbors.isEmpty()) {
                        String oldRoom = npc.getCurrentRoom();
                        String newRoom = npc.randomWalk(neighbors);

                        // 更新房间中的 NPC 记录
                        Room oldR = world.getRoom(oldRoom);
                        if (oldR != null) oldR.removeNpc(npc.getName());
                        Room newR = world.getRoom(newRoom);
                        if (newR != null) newR.addNpc(npc.getName());

                        // 广播 NPC 移动
                        broadcastToRoom(oldRoom, npc.getName() + " 离开了这里。", null);
                        broadcastToRoom(newRoom, npc.getName() + " 走了过来。", null);
                    }
                }
            } catch (Exception e) {
                System.err.println("[NPC Walker] " + e.getMessage());
            }
        }, 30, 30, TimeUnit.SECONDS); // 每 30 秒走动一次
    }

    private void broadcastToRoom(String roomName, String message, String exclude) {
        Room room = world.getRoom(roomName);
        if (room == null) return;
        for (String pName : room.getOtherPlayers(exclude)) {
            ClientHandler h = handlers.get(pName);
            if (h != null) h.send(message);
        }
    }

    public void stop() {
        running = false;
        npcScheduler.shutdown();
        playerDB.saveAll();
        try { serverSocket.close(); } catch (IOException ignored) {}
        System.out.println("[MudServer] 服务器已关闭。");
    }

    // ===== 入口 =====

    public static void main(String[] args) {
        int port = DEFAULT_PORT;
        if (args.length > 0) {
            try {
                port = Integer.parseInt(args[0]);
            } catch (NumberFormatException e) {
                System.err.println("无效的端口号: " + args[0]);
                return;
            }
        }

        try {
            MudServer server = new MudServer(port);
            // 注册关闭钩子
            Runtime.getRuntime().addShutdownHook(new Thread(server::stop));
            server.start();
        } catch (IOException e) {
            System.err.println("服务器启动失败: " + e.getMessage());
            System.exit(1);
        }
    }
}
