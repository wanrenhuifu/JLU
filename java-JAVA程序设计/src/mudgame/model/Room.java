package mudgame.model;

import java.io.Serializable;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 房间。代表游戏世界中的一个位置，包含物品、NPC、玩家和出口。
 */
public class Room implements Serializable {
    private static final long serialVersionUID = 1L;

    private final String name;
    private final String description;
    private final Map<Direction, String> exits;     // 方向 → 目标房间名
    private final List<Item> items;                  // 地上的物品
    private final Set<String> npcs;                  // 房间内的 NPC 名
    private final Set<String> players;               // 房间内的玩家名

    public Room(String name, String description) {
        this.name = name;
        this.description = description;
        this.exits = new LinkedHashMap<>();
        this.items = Collections.synchronizedList(new ArrayList<>());
        this.npcs = ConcurrentHashMap.newKeySet();
        this.players = ConcurrentHashMap.newKeySet();
    }

    // ===== Getters =====
    public String getName() { return name; }
    public String getDescription() { return description; }
    public Map<Direction, String> getExits() { return exits; }
    public List<Item> getItems() { return items; }
    public Set<String> getNpcs() { return npcs; }
    public Set<String> getPlayers() { return players; }

    // ===== 出口 =====
    public void addExit(Direction dir, String targetRoom) {
        exits.put(dir, targetRoom);
    }

    public String getExit(Direction dir) {
        return exits.get(dir);
    }

    /** 获取通往指定房间的方向，无则返回 null */
    public Direction getDirectionTo(String roomName) {
        for (Map.Entry<Direction, String> entry : exits.entrySet()) {
            if (entry.getValue().equals(roomName)) return entry.getKey();
        }
        return null;
    }

    // ===== 物品 =====
    public void addItem(Item item) {
        items.add(item);
    }

    public Item removeItem(String itemName) {
        synchronized (items) {
            for (Item item : items) {
                if (item.getName().equals(itemName)) {
                    items.remove(item);
                    return item;
                }
            }
        }
        return null;
    }

    public List<Item> getVisibleItems() {
        List<Item> visible = new ArrayList<>();
        synchronized (items) {
            for (Item item : items) {
                if (item.isOnGround()) visible.add(item);
            }
        }
        return visible;
    }

    // ===== NPC =====
    public void addNpc(String npcName) { npcs.add(npcName); }
    public void removeNpc(String npcName) { npcs.remove(npcName); }

    // ===== 玩家 =====
    public void addPlayer(String playerName) { players.add(playerName); }
    public void removePlayer(String playerName) { players.remove(playerName); }

    /** 获取除指定玩家外的其他玩家名（用于广播） */
    public Set<String> getOtherPlayers(String playerName) {
        Set<String> others = new HashSet<>(players);
        others.remove(playerName);
        return others;
    }

    // ===== 描述 =====
    public String look() {
        StringBuilder sb = new StringBuilder();
        sb.append("【").append(name).append("】\n");
        sb.append(description).append("\n");

        // 出口
        if (exits.isEmpty()) {
            sb.append("这里没有明显的出口。\n");
        } else {
            sb.append("出口: ");
            for (Map.Entry<Direction, String> e : exits.entrySet()) {
                sb.append(e.getKey().getChinese())
                  .append("(").append(e.getKey().getCode()).append(")→")
                  .append(e.getValue()).append("  ");
            }
            sb.append("\n");
        }

        // 地上的物品
        List<Item> visible = getVisibleItems();
        if (!visible.isEmpty()) {
            sb.append("地上: ");
            for (Item item : visible) {
                sb.append(item.getName()).append(" ");
            }
            sb.append("\n");
        }

        // NPC
        if (!npcs.isEmpty()) {
            sb.append("这里有人: ");
            for (String npc : npcs) {
                sb.append(npc).append(" ");
            }
            sb.append("\n");
        }

        // 其他玩家
        if (!players.isEmpty()) {
            sb.append("其他玩家: ");
            for (String p : players) {
                sb.append(p).append(" ");
            }
            sb.append("\n");
        }

        return sb.toString();
    }
}
