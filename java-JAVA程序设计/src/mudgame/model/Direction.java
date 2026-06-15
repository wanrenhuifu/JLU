package mudgame.model;

/**
 * 游戏中可用的移动方向。
 */
public enum Direction {
    NORTH("n", "北"),
    SOUTH("s", "南"),
    EAST("e", "东"),
    WEST("w", "西"),
    NORTHEAST("ne", "东北"),
    SOUTHEAST("se", "东南"),
    NORTHWEST("nw", "西北"),
    SOUTHWEST("sw", "西南"),
    UP("u", "上"),
    DOWN("d", "下");

    private final String code;
    private final String chinese;

    Direction(String code, String chinese) {
        this.code = code;
        this.chinese = chinese;
    }

    public String getCode() { return code; }
    public String getChinese() { return chinese; }

    /** 根据命令字符串查找方向，找不到返回 null */
    public static Direction fromCode(String code) {
        for (Direction d : values()) {
            if (d.code.equalsIgnoreCase(code)) return d;
        }
        return null;
    }

    /** 获取相反方向 */
    public Direction opposite() {
        switch (this) {
            case NORTH: return SOUTH;
            case SOUTH: return NORTH;
            case EAST: return WEST;
            case WEST: return EAST;
            case NORTHEAST: return SOUTHWEST;
            case SOUTHWEST: return NORTHEAST;
            case NORTHWEST: return SOUTHEAST;
            case SOUTHEAST: return NORTHWEST;
            case UP: return DOWN;
            case DOWN: return UP;
            default: return null;
        }
    }
}
