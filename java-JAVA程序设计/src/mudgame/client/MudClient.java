package mudgame.client;

import java.io.*;
import java.net.Socket;

/**
 * MUD 游戏客户端。通过 Socket 连接到服务器，终端交互式操作。
 *
 * 用法: java mudgame.client.MudClient [host] [port]
 * 默认: localhost:8888
 */
public class MudClient {

    private static final String DEFAULT_HOST = "localhost";
    private static final int DEFAULT_PORT = 8888;

    private final String host;
    private final int port;
    private Socket socket;
    private BufferedReader serverIn;
    private PrintWriter serverOut;
    private BufferedReader userIn;

    public MudClient(String host, int port) {
        this.host = host;
        this.port = port;
    }

    public void start() throws IOException {
        // 连接服务器
        socket = new Socket(host, port);
        serverIn = new BufferedReader(new InputStreamReader(socket.getInputStream(), "UTF-8"));
        serverOut = new PrintWriter(new OutputStreamWriter(socket.getOutputStream(), "UTF-8"), true);
        userIn = new BufferedReader(new InputStreamReader(System.in, "UTF-8"));

        System.out.println("已连接到服务器 " + host + ":" + port);

        // 启动接收线程
        Thread receiver = new Thread(this::receiveMessages);
        receiver.setDaemon(true);
        receiver.start();

        // 主线程负责发送用户输入
        try {
            String line;
            while ((line = userIn.readLine()) != null) {
                if (line.trim().isEmpty()) continue;
                serverOut.println(line.trim());

                // quit 命令退出
                if (line.trim().equalsIgnoreCase("quit")) {
                    Thread.sleep(500); // 等待接收最后的消息
                    break;
                }
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            disconnect();
        }
    }

    /** 接收服务器消息并打印到控制台 */
    private void receiveMessages() {
        try {
            String line;
            while ((line = serverIn.readLine()) != null) {
                System.out.println(line);
            }
        } catch (IOException e) {
            // 连接关闭
        } finally {
            System.out.println("与服务器的连接已断开。");
            System.exit(0);
        }
    }

    private void disconnect() {
        try { socket.close(); } catch (IOException ignored) {}
    }

    // ===== 入口 =====

    public static void main(String[] args) {
        String host = DEFAULT_HOST;
        int port = DEFAULT_PORT;

        if (args.length >= 1) host = args[0];
        if (args.length >= 2) {
            try {
                port = Integer.parseInt(args[1]);
            } catch (NumberFormatException e) {
                System.err.println("无效的端口号: " + args[1]);
                return;
            }
        }

        try {
            MudClient client = new MudClient(host, port);
            client.start();
        } catch (IOException e) {
            System.err.println("无法连接到服务器 " + host + ":" + port);
            System.err.println("请确认服务器已启动。");
            System.exit(1);
        }
    }
}
