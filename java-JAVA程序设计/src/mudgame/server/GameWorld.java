package mudgame.server;

import mudgame.model.*;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 游戏世界。初始化所有房间、物品、NPC 和武功，管理世界状态。
 */
public class GameWorld {

    private final Map<String, Room> rooms = new LinkedHashMap<>();
    private final Map<String, NPC> npcs = new ConcurrentHashMap<>();
    private final Map<String, KungFu> kungFuMap = new LinkedHashMap<>();
    private final Map<String, Player> players = new ConcurrentHashMap<>();
    private final List<Item> allItems = new ArrayList<>();

    /** 初始化游戏世界 */
    public void init() {
        createRooms();
        createItems();
        createNPCs();
        createKungFu();
    }

    // ===== 房间创建 =====

    private void createRooms() {
        // 中心区域
        addRoom("城镇广场", "一座繁华的城镇广场，青石板铺地，中央有一座喷泉。这里是冒险者的聚集地。");
        addRoom("铁匠铺", "叮叮当当的打铁声不绝于耳。墙上挂满了各种兵器，炉火烧得正旺。");
        addRoom("药铺", "空气中弥漫着草药的味道。柜台上摆满了各种瓶瓶罐罐。");
        addRoom("酒馆", "温暖的灯光从窗户透出，里面传来欢笑和歌声。冒险者们在这里交换情报。");
        addRoom("神庙", "一座古老的神庙，巨大的石柱撑起穹顶。地板上刻满了神秘的符文。");

        // 森林区域
        addRoom("林间小路", "一条蜿蜒的林间小路，阳光透过树叶洒下斑驳的光影。鸟鸣声此起彼伏。");
        addRoom("密林深处", "高大的树木遮天蔽日，四周昏暗潮湿。远处传来不知名的野兽嚎叫。");
        addRoom("山道", "崎岖的山路通往远方的山峰。路边的岩石上长满了青苔。");
        addRoom("洞穴入口", "一个黑暗的洞穴入口，冷风从洞中吹出。洞壁上隐约可见闪光的矿石。");
        addRoom("龙穴", "巨大的地下洞穴，空气中弥漫着硫磺的气味。角落里有巨大的爪印。");

        // 河岸区域
        addRoom("河岸", "一条宽阔的河流缓缓流过。河水清澈见底，可以看到鱼儿在水中游动。");
        addRoom("古桥", "一座古老的石拱桥横跨河面。桥栏上雕刻着古老的图案。");

        // 神秘区域
        addRoom("女巫小屋", "一间隐藏在密林中的小屋。门口挂满了各种奇怪的护符和草药。");
        addRoom("墓地", "一片寂静的墓地，墓碑歪斜，杂草丛生。空气中弥漫着不安的气息。");

        // 连接出口
        connect("城镇广场", Direction.NORTH, "林间小路");
        connect("城镇广场", Direction.SOUTH, "铁匠铺");
        connect("城镇广场", Direction.EAST, "酒馆");
        connect("城镇广场", Direction.WEST, "神庙");

        connect("铁匠铺", Direction.WEST, "药铺");

        connect("酒馆", Direction.EAST, "河岸");

        connect("河岸", Direction.NORTH, "古桥");

        connect("神庙", Direction.SOUTH, "墓地");
        connect("墓地", Direction.SOUTH, "女巫小屋");

        connect("林间小路", Direction.NORTH, "密林深处");
        connect("密林深处", Direction.WEST, "山道");
        connect("密林深处", Direction.EAST, "洞穴入口");
        connect("洞穴入口", Direction.DOWN, "龙穴");
    }

    private void addRoom(String name, String desc) {
        rooms.put(name, new Room(name, desc));
    }

    private void connect(String from, Direction dir, String to) {
        Room r1 = rooms.get(from);
        Room r2 = rooms.get(to);
        if (r1 != null && r2 != null) {
            r1.addExit(dir, to);
            r2.addExit(dir.opposite(), from);
        }
    }

    // ===== 物品创建 =====

    private void createItems() {
        addItemToRoom("铁剑", "一把锋利的铁剑，剑身上刻着古老的符文。", "铁匠铺");
        addItemToRoom("生命药剂", "一瓶红色的药水，散发着温暖的光芒。饮用后可恢复30点HP。", "药铺");
        addItemToRoom("魔法护符", "一枚闪耀着蓝色光芒的护符，上面刻着神秘的文字。", "神庙");
        addItemToRoom("金袋", "一个沉甸甸的钱袋，里面装满了金币。", "洞穴入口");
        addItemToRoom("哥布林匕首", "一把粗制滥造的匕首，但好歹是把武器。", "墓地");
    }

    private void addItemToRoom(String name, String desc, String roomName) {
        Item item = new Item(name, desc);
        allItems.add(item);
        Room room = rooms.get(roomName);
        if (room != null) room.addItem(item);
    }

    // ===== NPC 创建 =====

    private void createNPCs() {
        // 老巫师 — 教武功
        NPC wizard = new NPC(
            "老巫师",
            "一位白发苍苍的老巫师，手持法杖，眼神中透着智慧的光芒。",
            Arrays.asList(
                "年轻人，你想学习龙拳吗？",
                "武功需要勤加练习才能精进。",
                "我曾经用龙拳打败过一条巨龙。",
                "这世上的武功，都在等待有缘人。"
            ),
            "神庙", false, 999
        );
        npcs.put(wizard.getName(), wizard);
        rooms.get("神庙").addNpc(wizard.getName());

        // 哥布林 — 会战斗
        NPC goblin = new NPC(
            "哥布林",
            "一只绿皮肤的小怪物，手持木棒，龇牙咧嘴。",
            Arrays.asList(
                "嘎嘎！人类！",
                "这是我的地盘！",
                "我要把你的东西都抢走！"
            ),
            "墓地", true, 30
        );
        npcs.put(goblin.getName(), goblin);
        rooms.get("墓地").addNpc(goblin.getName());

        // 商人 — 卖东西
        NPC merchant = new NPC(
            "旅行商人",
            "一位背着大包的旅行商人，笑容满面，看起来很好说话。",
            Arrays.asList(
                "走过路过不要错过！",
                "我有上好的货物，来看看吧！",
                "这年头生意不好做啊。",
                "听说龙穴里有宝藏，但我可不敢去。"
            ),
            "城镇广场", false, 999
        );
        npcs.put(merchant.getName(), merchant);
        rooms.get("城镇广场").addNpc(merchant.getName());
    }

    // ===== 武功创建 =====

    private void createKungFu() {
        kungFuMap.put("龙拳", new KungFu("龙拳", 25, "传自上古龙族的神秘拳法，拳风如龙吟。"));
        kungFuMap.put("影步", new KungFu("影步", 20, "如影子般迅捷的步法，让对手难以捕捉。"));
        kungFuMap.put("雷霆掌", new KungFu("雷霆掌", 30, "蕴含着雷电之力的掌法，一掌下去天崩地裂。"));
    }

    // ===== 查询方法 =====

    public Room getRoom(String name) { return rooms.get(name); }
    public Map<String, Room> getRooms() { return rooms; }
    public Map<String, NPC> getNpcs() { return npcs; }
    public Map<String, KungFu> getKungFuMap() { return kungFuMap; }
    public Map<String, Player> getPlayers() { return players; }
    public List<Item> getAllItems() { return allItems; }

    public NPC getNpc(String name) { return npcs.get(name); }

    /** 获取指定房间的相邻房间名列表 */
    public List<String> getNeighborRooms(String roomName) {
        List<String> neighbors = new ArrayList<>();
        Room room = rooms.get(roomName);
        if (room != null) {
            neighbors.addAll(room.getExits().values());
        }
        return neighbors;
    }

    // ===== 玩家管理 =====

    public void addPlayer(Player player) {
        players.put(player.getName(), player);
        Room room = rooms.get(player.getCurrentRoom());
        if (room != null) room.addPlayer(player.getName());
    }

    public void removePlayer(String playerName) {
        Player player = players.get(playerName);
        if (player != null) {
            Room room = rooms.get(player.getCurrentRoom());
            if (room != null) room.removePlayer(playerName);
        }
        players.remove(playerName);
    }

    public Player getPlayer(String name) { return players.get(name); }

    /** 获取所有在线玩家名 */
    public Set<String> getOnlinePlayers() {
        Set<String> online = new HashSet<>();
        for (Player p : players.values()) {
            if (p.isOnline()) online.add(p.getName());
        }
        return online;
    }

    /** 移动玩家到新房间 */
    public String movePlayer(String playerName, Direction dir) {
        Player player = players.get(playerName);
        if (player == null) return "你不在游戏中。";

        Room currentRoom = rooms.get(player.getCurrentRoom());
        if (currentRoom == null) return "你所在的位置不存在！";

        String targetRoomName = currentRoom.getExit(dir);
        if (targetRoomName == null) return "那个方向没有路。";

        Room targetRoom = rooms.get(targetRoomName);
        if (targetRoom == null) return "目标位置不存在！";

        // 离开当前房间
        currentRoom.removePlayer(playerName);
        // 进入新房间
        player.setCurrentRoom(targetRoomName);
        targetRoom.addPlayer(playerName);

        return "你向" + dir.getChinese() + "移动，来到了「" + targetRoomName + "」。";
    }
}
