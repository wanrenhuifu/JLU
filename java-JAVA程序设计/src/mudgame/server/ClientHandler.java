package mudgame.server;

import mudgame.model.*;
import mudgame.util.PlayerDB;

import java.io.*;
import java.net.Socket;
import java.util.Map;
import java.util.Set;

/**
 * 客户端处理线程。每个在线玩家对应一个实例，负责收发消息和命令解析。
 */
public class ClientHandler extends Thread {

    private final Socket socket;
    private final GameWorld world;
    private final Player player;
    private final PlayerDB playerDB;
    private final Map<String, ClientHandler> allHandlers;

    private BufferedReader in;
    private PrintWriter out;
    private volatile boolean running = true;

    public ClientHandler(Socket socket, GameWorld world, Player player,
                         PlayerDB playerDB, Map<String, ClientHandler> allHandlers) {
        this.socket = socket;
        this.world = world;
        this.player = player;
        this.playerDB = playerDB;
        this.allHandlers = allHandlers;
    }

    @Override
    public void run() {
        try {
            in = new BufferedReader(new InputStreamReader(socket.getInputStream(), "UTF-8"));
            out = new PrintWriter(new OutputStreamWriter(socket.getOutputStream(), "UTF-8"), true);

            send(welcome());
            broadcastToRoom(player.getCurrentRoom(),
                "✨ " + player.getName() + " 进入了游戏。", player.getName());

            String line;
            while (running && (line = in.readLine()) != null) {
                if (line.trim().isEmpty()) continue;
                String result = handleCommand(line.trim());
                if (result != null) {
                    send(result);
                }
                if (!running) break;
            }
        } catch (IOException e) {
            // 客户端断开
        } finally {
            disconnect();
        }
    }

    // ===== 命令处理 =====

    private String handleCommand(String input) {
        String[] parts = input.split("\\s+", 3);
        String cmd = parts[0].toLowerCase();

        switch (cmd) {
            // 移动
            case "n": case "s": case "e": case "w":
            case "ne": case "se": case "nw": case "sw":
            case "u": case "d":
                return handleMove(cmd);

            // 查看
            case "look": case "l":
                return player.getCurrentRoom() != null
                    ? world.getRoom(player.getCurrentRoom()).look()
                    : "你身处虚无之中...";

            // 退出
            case "quit":
                return handleQuit();

            // 喊话/群聊
            case "chat":
                if (parts.length < 2) return "用法: chat <消息>";
                return handleChat(parts[1]);

            // 私聊
            case "tell":
                if (parts.length < 3) return "用法: tell <玩家名> <消息>";
                return handleTell(parts[1], parts[2]);

            // 在线玩家
            case "who":
                return handleWho();

            // 物品操作
            case "get":
                if (parts.length < 2) return "用法: get <物品名>";
                return handleGet(parts[1]);
            case "drop":
                if (parts.length < 2) return "用法: drop <物品名>";
                return handleDrop(parts[1]);

            // 背包
            case "inventory": case "inv": case "i":
                return handleInventory();

            // 状态
            case "hp": case "status": case "st":
                return player.status();

            // NPC 交互
            case "talk":
                if (parts.length < 2) return "用法: talk <NPC名>";
                return handleTalk(parts[1]);

            // 战斗
            case "fight":
                if (parts.length < 2) return "用法: fight <NPC名> [武功名]";
                String kfName = parts.length >= 3 ? parts[2] : null;
                return handleFight(parts[1], kfName);

            // 学习武功
            case "learn":
                if (parts.length < 2) return "用法: learn <武功名>";
                return handleLearn(parts[1]);

            // 使用物品
            case "use":
                if (parts.length < 2) return "用法: use <物品名>";
                return handleUse(parts[1]);

            // 帮助
            case "help": case "?":
                return helpText();

            default:
                return "未知命令: " + cmd + "。输入 help 查看可用命令。";
        }
    }

    // ===== 命令实现 =====

    private String handleMove(String dirCode) {
        Direction dir = Direction.fromCode(dirCode);
        if (dir == null) return "无效的方向: " + dirCode;

        String oldRoom = player.getCurrentRoom();
        String result = world.movePlayer(player.getName(), dir);

        if (result != null && !result.contains("没有路") && !result.contains("不存在")) {
            // 广播离开
            broadcastToRoom(oldRoom, player.getName() + " 离开了这里。", player.getName());
            // 广播进入
            broadcastToRoom(player.getCurrentRoom(),
                player.getName() + " 从远处走来。", player.getName());
            // 返回新房间的描述
            result += "\n" + world.getRoom(player.getCurrentRoom()).look();
        }
        return result;
    }

    private String handleQuit() {
        running = false;
        broadcastToRoom(player.getCurrentRoom(),
            player.getName() + " 退出了游戏。", player.getName());
        return "再见，" + player.getName() + "！";
    }

    private String handleChat(String message) {
        String full = "💬 " + player.getName() + " 喊道：「" + message + "」";
        broadcastToRoom(player.getCurrentRoom(), full, null);
        return "你喊道：「" + message + "」";
    }

    private String handleTell(String targetName, String message) {
        ClientHandler target = allHandlers.get(targetName);
        if (target == null) return "玩家 " + targetName + " 不在线。";
        target.send("📩 " + player.getName() + " 悄悄对你说：「" + message + "」");
        return "你悄悄对 " + targetName + " 说：「" + message + "」";
    }

    private String handleWho() {
        Set<String> online = world.getOnlinePlayers();
        StringBuilder sb = new StringBuilder("===== 在线玩家 =====\n");
        for (String name : online) {
            Player p = world.getPlayer(name);
            sb.append("  ").append(name)
              .append(" — ").append(p.getCurrentRoom())
              .append(" [HP:").append(p.getHp()).append("]");
            if (name.equals(player.getName())) sb.append(" ← 你");
            sb.append("\n");
        }
        sb.append("共 ").append(online.size()).append(" 人在线");
        return sb.toString();
    }

    private String handleGet(String itemName) {
        Room room = world.getRoom(player.getCurrentRoom());
        if (room == null) return "你不在任何房间中。";

        Item item = room.removeItem(itemName);
        if (item == null) return "这里没有 " + itemName + "。";

        player.addItem(item);
        broadcastToRoom(player.getCurrentRoom(),
            player.getName() + " 捡起了 " + itemName + "。", player.getName());
        return "你捡起了 " + itemName + "。";
    }

    private String handleDrop(String itemName) {
        Item item = player.removeItem(itemName);
        if (item == null) return "你的背包里没有 " + itemName + "。";

        Room room = world.getRoom(player.getCurrentRoom());
        if (room != null) room.addItem(item);

        broadcastToRoom(player.getCurrentRoom(),
            player.getName() + " 丢下了 " + itemName + "。", player.getName());
        return "你丢下了 " + itemName + "。";
    }

    private String handleInventory() {
        if (player.getInventory().isEmpty()) {
            return "你的背包空空如也。";
        }
        StringBuilder sb = new StringBuilder("===== 背包 =====\n");
        for (Item item : player.getInventory()) {
            sb.append("  ").append(item.getName())
              .append(" — ").append(item.getDescription()).append("\n");
        }
        return sb.toString();
    }

    private String handleTalk(String npcName) {
        NPC npc = world.getNpc(npcName);
        if (npc == null) return "这里没有叫 " + npcName + " 的人。";

        // 检查 NPC 是否在同一房间
        if (!player.getCurrentRoom().equals(npc.getCurrentRoom())) {
            return npcName + " 不在这里。";
        }

        return npc.talk();
    }

    private String handleFight(String npcName, String kfName) {
        NPC npc = world.getNpc(npcName);
        if (npc == null) return "这里没有 " + npcName + "。";
        if (!npc.canFight()) return npcName + " 不是战斗目标。";
        if (!player.getCurrentRoom().equals(npc.getCurrentRoom())) {
            return npcName + " 不在这里。";
        }

        // 计算伤害
        int playerDamage;
        String attackDesc;
        if (kfName != null && player.hasKungFu(kfName)) {
            playerDamage = player.kungFuAttack(kfName);
            attackDesc = "你使出「" + kfName + "」";
        } else {
            playerDamage = player.baseAttack();
            attackDesc = "你挥拳攻击";
        }
        attackDesc += "，造成了 " + playerDamage + " 点伤害！";

        // NPC 受伤
        boolean npcDead = npc.takeDamage(playerDamage);

        StringBuilder sb = new StringBuilder();
        sb.append("⚔️ 战斗开始！\n");
        sb.append(attackDesc).append("\n");

        if (npcDead) {
            sb.append(npcName + " 被你打败了！\n");
            // 从房间移除 NPC
            Room room = world.getRoom(npc.getCurrentRoom());
            if (room != null) room.removeNpc(npcName);
            world.getNpcs().remove(npcName);

            // 哥布林掉落物品
            if (npcName.equals("哥布林")) {
                Item dagger = new Item("哥布林匕首", "一把粗制滥造的匕首，但好歹是把武器。");
                if (room != null) room.addItem(dagger);
                sb.append("哥布林掉落了 ").append(dagger.getName()).append("！\n");
            }

            broadcastToRoom(player.getCurrentRoom(),
                player.getName() + " 打败了 " + npcName + "！", player.getName());
        } else {
            // NPC 反击
            int npcDamage = 5 + (int) (Math.random() * 10);
            boolean playerDead = player.takeDamage(npcDamage);
            sb.append(npcName + " 反击，对你造成了 " + npcDamage + " 点伤害！\n");
            sb.append("你的 HP: ").append(player.getHp()).append("/").append(player.getMaxHp()).append("\n");
            sb.append(npcName + " 的 HP: ").append(npc.getHp()).append("\n");

            if (playerDead) {
                sb.append("你被打倒了！正在返回城镇广场...\n");
                Room oldRoom = world.getRoom(player.getCurrentRoom());
                if (oldRoom != null) oldRoom.removePlayer(player.getName());
                player.heal(player.getMaxHp()); // 复活
                player.setCurrentRoom("城镇广场");
                Room townSquare = world.getRoom("城镇广场");
                if (townSquare != null) townSquare.addPlayer(player.getName());
                sb.append("你在城镇广场复活了。\n");
            }
        }

        return sb.toString();
    }

    private String handleLearn(String kfName) {
        // 只有老巫师能教武功
        NPC wizard = world.getNpc("老巫师");
        if (wizard == null) return "没有人可以教你武功。";
        if (!player.getCurrentRoom().equals(wizard.getCurrentRoom())) {
            return "老巫师不在这里。";
        }

        KungFu kf = world.getKungFuMap().get(kfName);
        if (kf == null) return "没有叫「" + kfName + "」的武功。";

        if (player.hasKungFu(kfName)) {
            return "你已经学会了「" + kfName + "」。";
        }

        player.learnKungFu(kf);
        playerDB.save(player);
        return "老巫师传授了你「" + kfName + "」！\n" + kf.getDescription();
    }

    private String handleUse(String itemName) {
        Item item = player.findItem(itemName);
        if (item == null) return "你的背包里没有 " + itemName + "。";

        if (item.getName().equals("生命药剂")) {
            int before = player.getHp();
            player.heal(30);
            int healed = player.getHp() - before;
            player.removeItem(itemName);
            playerDB.save(player);
            return "你喝下了生命药剂，恢复了 " + healed + " 点HP！\n当前 HP: "
                + player.getHp() + "/" + player.getMaxHp();
        }

        return itemName + " 无法使用。";
    }

    // ===== 通信方法 =====

    public void send(String message) {
        if (out != null) {
            out.println(message);
            out.flush();
        }
    }

    public Player getPlayer() { return player; }

    private void broadcastToRoom(String roomName, String message, String excludePlayer) {
        Room room = world.getRoom(roomName);
        if (room == null) return;

        for (String playerName : room.getOtherPlayers(excludePlayer)) {
            ClientHandler handler = allHandlers.get(playerName);
            if (handler != null) {
                handler.send(message);
            }
        }
    }

    private void disconnect() {
        running = false;
        if (player != null) {
            player.setOnline(false);
            Room room = world.getRoom(player.getCurrentRoom());
            if (room != null) room.removePlayer(player.getName());
            broadcastToRoom(player.getCurrentRoom(),
                player.getName() + " 断开了连接。", player.getName());
            playerDB.save(player);
        }
        allHandlers.remove(player != null ? player.getName() : "");
        try { socket.close(); } catch (IOException ignored) {}
    }

    // ===== 欢迎与帮助 =====

    private String welcome() {
        return "╔══════════════════════════════════╗\n" +
               "║      🏰 欢迎来到 MUD 世界！      ║\n" +
               "╠══════════════════════════════════╣\n" +
               "║ 输入 help 查看命令列表            ║\n" +
               "╚══════════════════════════════════╝\n" +
               world.getRoom(player.getCurrentRoom()).look();
    }

    private String helpText() {
        return "══════════ 命令列表 ══════════\n" +
            "【移动】n s e w ne se nw sw u d\n" +
            "【查看】look / l\n" +
            "【状态】hp / status\n" +
            "【背包】inventory / i\n" +
            "【物品】get <物品> | drop <物品>\n" +
            "        use <物品>\n" +
            "【交流】chat <消息>\n" +
            "        tell <玩家> <消息>\n" +
            "        who （查看在线玩家）\n" +
            "【NPC】 talk <NPC名>\n" +
            "       fight <NPC名> [武功]\n" +
            "       learn <武功名> （找老巫师）\n" +
            "【系统】quit | help\n" +
            "══════════════════════════════";
    }
}
