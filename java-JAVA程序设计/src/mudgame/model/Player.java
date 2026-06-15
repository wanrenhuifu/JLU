package mudgame.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * 玩家状态。记录玩家的所有信息，支持序列化持久化。
 */
public class Player implements Serializable {
    private static final long serialVersionUID = 1L;

    private final String name;
    private final String password;           // 简单密码
    private String currentRoom;
    private int hp;
    private int maxHp;
    private final List<Item> inventory;      // 背包
    private final Set<KungFu> kungFuSkills;  // 已学武功
    private boolean online;

    public Player(String name, String password) {
        this.name = name;
        this.password = password;
        this.currentRoom = "城镇广场";
        this.hp = 100;
        this.maxHp = 100;
        this.inventory = new ArrayList<>();
        this.kungFuSkills = new HashSet<>();
        this.online = false;
    }

    // ===== Getters =====
    public String getName() { return name; }
    public String getPassword() { return password; }
    public String getCurrentRoom() { return currentRoom; }
    public int getHp() { return hp; }
    public int getMaxHp() { return maxHp; }
    public List<Item> getInventory() { return inventory; }
    public Set<KungFu> getKungFuSkills() { return kungFuSkills; }
    public boolean isOnline() { return online; }

    // ===== Setters =====
    public void setCurrentRoom(String room) { this.currentRoom = room; }
    public void setOnline(boolean online) { this.online = online; }

    // ===== HP =====
    public void heal(int amount) {
        hp = Math.min(hp + amount, maxHp);
    }

    /** 受到伤害，返回是否死亡（HP ≤ 0） */
    public boolean takeDamage(int damage) {
        hp -= damage;
        return hp <= 0;
    }

    // ===== 物品 =====
    public void addItem(Item item) {
        inventory.add(item);
        item.pickUp(name);
    }

    public Item removeItem(String itemName) {
        for (Item item : inventory) {
            if (item.getName().equals(itemName)) {
                inventory.remove(item);
                item.drop();
                return item;
            }
        }
        return null;
    }

    public Item findItem(String itemName) {
        for (Item item : inventory) {
            if (item.getName().equals(itemName)) return item;
        }
        return null;
    }

    public boolean hasItem(String itemName) {
        return findItem(itemName) != null;
    }

    // ===== 武功 =====
    public void learnKungFu(KungFu kf) {
        kungFuSkills.add(kf);
    }

    public boolean hasKungFu(String kfName) {
        for (KungFu kf : kungFuSkills) {
            if (kf.getName().equals(kfName)) return true;
        }
        return false;
    }

    public KungFu getKungFu(String kfName) {
        for (KungFu kf : kungFuSkills) {
            if (kf.getName().equals(kfName)) return kf;
        }
        return null;
    }

    /** 计算普通攻击伤害（无武功时） */
    public int baseAttack() {
        return 10 + (int) (Math.random() * 10);
    }

    /** 使用武功攻击 */
    public int kungFuAttack(String kfName) {
        KungFu kf = getKungFu(kfName);
        if (kf == null) return baseAttack();
        return kf.getDamage() + (int) (Math.random() * 5);
    }

    // ===== 状态描述 =====
    public String status() {
        StringBuilder sb = new StringBuilder();
        sb.append("===== ").append(name).append(" =====\n");
        sb.append("HP: ").append(hp).append("/").append(maxHp).append("\n");
        sb.append("位置: ").append(currentRoom).append("\n");
        sb.append("背包: ");
        if (inventory.isEmpty()) {
            sb.append("空空如也");
        } else {
            for (Item item : inventory) {
                sb.append(item.getName()).append(" ");
            }
        }
        sb.append("\n");
        sb.append("武功: ");
        if (kungFuSkills.isEmpty()) {
            sb.append("无");
        } else {
            for (KungFu kf : kungFuSkills) {
                sb.append(kf.getName()).append(" ");
            }
        }
        return sb.toString();
    }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof Player) return name.equals(((Player) obj).name);
        return false;
    }

    @Override
    public int hashCode() { return name.hashCode(); }
}
