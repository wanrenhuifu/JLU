package mudgame.model;

import java.io.Serializable;

/**
 * 武功技能。玩家可以获得武功并通过武功进行战斗。
 */
public class KungFu implements Serializable {
    private static final long serialVersionUID = 1L;

    private final String name;
    private final int damage;       // 基础伤害
    private final String description;

    public KungFu(String name, int damage, String description) {
        this.name = name;
        this.damage = damage;
        this.description = description;
    }

    public String getName() { return name; }
    public int getDamage() { return damage; }
    public String getDescription() { return description; }

    @Override
    public String toString() {
        return name + " [伤害:" + damage + "] — " + description;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof KungFu) return name.equals(((KungFu) obj).name);
        return false;
    }

    @Override
    public int hashCode() { return name.hashCode(); }
}
