package mudgame.model;

import java.io.Serializable;

/**
 * 游戏中的物品。可以被 get/drop，同一时间只能被一个玩家持有。
 */
public class Item implements Serializable {
    private static final long serialVersionUID = 1L;

    private final String name;
    private final String description;
    private String holder;   // 持有者玩家名，null 表示在地上

    public Item(String name, String description) {
        this.name = name;
        this.description = description;
        this.holder = null;
    }

    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getHolder() { return holder; }

    public boolean isOnGround() { return holder == null; }

    public void pickUp(String playerName) { this.holder = playerName; }
    public void drop() { this.holder = null; }

    @Override
    public String toString() {
        return name + (holder != null ? " (持有者: " + holder + ")" : "");
    }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof Item) return name.equals(((Item) obj).name);
        return false;
    }

    @Override
    public int hashCode() { return name.hashCode(); }
}
