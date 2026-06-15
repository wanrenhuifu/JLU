package mudgame.model;

import java.io.Serializable;
import java.util.List;
import java.util.Random;

/**
 * 非玩家角色（NPC）。可以在游戏世界中随机走动，与玩家交互。
 */
public class NPC implements Serializable {
    private static final long serialVersionUID = 1L;
    private static final Random RAND = new Random();

    private final String name;
    private final String description;
    private final List<String> dialogues;    // 对话列表
    private String currentRoom;              // 当前所在房间名
    private final boolean canFight;          // 是否可以战斗
    private int hp;

    public NPC(String name, String description, List<String> dialogues,
               String startRoom, boolean canFight, int hp) {
        this.name = name;
        this.description = description;
        this.dialogues = dialogues;
        this.currentRoom = startRoom;
        this.canFight = canFight;
        this.hp = hp;
    }

    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getCurrentRoom() { return currentRoom; }
    public boolean canFight() { return canFight; }
    public int getHp() { return hp; }

    public void setCurrentRoom(String room) { this.currentRoom = room; }

    /** 减少 HP，返回是否死亡 */
    public boolean takeDamage(int damage) {
        hp -= damage;
        return hp <= 0;
    }

    /** 从相邻房间列表中随机选择一间走动 */
    public String randomWalk(List<String> neighborRooms) {
        if (neighborRooms.isEmpty()) return currentRoom;
        String target = neighborRooms.get(RAND.nextInt(neighborRooms.size()));
        currentRoom = target;
        return target;
    }

    /** 随机返回一句对话 */
    public String talk() {
        if (dialogues.isEmpty()) return name + " 沉默不语。";
        return name + " 说：「" + dialogues.get(RAND.nextInt(dialogues.size())) + "」";
    }

    @Override
    public String toString() {
        return name + (canFight ? " [HP:" + hp + "]" : "") + " — " + description;
    }
}
