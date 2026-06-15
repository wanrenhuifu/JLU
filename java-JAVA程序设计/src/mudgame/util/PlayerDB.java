package mudgame.util;

import mudgame.model.KungFu;
import mudgame.model.Player;

import java.io.*;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 玩家数据持久化。将玩家账户、HP、背包、武功存储到文件。
 * 格式：每行一个玩家，字段用 tab 分隔。
 *   NAME\tPASSWORD\tHP\tMAXHP\tROOM\tITEM1,ITEM2,...\tKF1,KF2,...
 */
public class PlayerDB {

    private final String filePath;
    private final Map<String, Player> players = new ConcurrentHashMap<>();

    public PlayerDB(String filePath) {
        this.filePath = filePath;
    }

    /** 加载所有玩家数据 */
    public Map<String, Player> loadAll(Map<String, KungFu> allKungFu) {
        players.clear();
        File file = new File(filePath);
        if (!file.exists()) return players;

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(new FileInputStream(file), "UTF-8"))) {
            String line;
            while ((line = reader.readLine()) != null) {
                Player p = deserialize(line, allKungFu);
                if (p != null) {
                    players.put(p.getName(), p);
                }
            }
        } catch (IOException e) {
            System.err.println("[PlayerDB] 加载失败: " + e.getMessage());
        }
        return players;
    }

    /** 保存所有玩家数据 */
    public void saveAll() {
        try (BufferedWriter writer = new BufferedWriter(
                new OutputStreamWriter(new FileOutputStream(filePath), "UTF-8"))) {
            for (Player p : players.values()) {
                writer.write(serialize(p));
                writer.newLine();
            }
        } catch (IOException e) {
            System.err.println("[PlayerDB] 保存失败: " + e.getMessage());
        }
    }

    public Player get(String name) { return players.get(name); }

    public Player create(String name, String password) {
        if (players.containsKey(name)) return null;
        Player p = new Player(name, password);
        players.put(name, p);
        saveAll();
        return p;
    }

    public void save(Player p) {
        players.put(p.getName(), p);
        saveAll();
    }

    public boolean exists(String name) {
        return players.containsKey(name);
    }

    // ===== 序列化 =====

    private String serialize(Player p) {
        StringBuilder sb = new StringBuilder();
        sb.append(p.getName()).append('\t');
        sb.append(p.getPassword()).append('\t');
        sb.append(p.getHp()).append('\t');
        sb.append(p.getMaxHp()).append('\t');
        sb.append(p.getCurrentRoom()).append('\t');

        // 物品列表
        if (p.getInventory().isEmpty()) {
            sb.append("-");
        } else {
            for (int i = 0; i < p.getInventory().size(); i++) {
                if (i > 0) sb.append(',');
                sb.append(p.getInventory().get(i).getName());
            }
        }
        sb.append('\t');

        // 武功列表
        if (p.getKungFuSkills().isEmpty()) {
            sb.append("-");
        } else {
            int i = 0;
            for (KungFu kf : p.getKungFuSkills()) {
                if (i > 0) sb.append(',');
                sb.append(kf.getName());
                i++;
            }
        }

        return sb.toString();
    }

    private Player deserialize(String line, Map<String, KungFu> allKungFu) {
        String[] parts = line.split("\t");
        if (parts.length < 7) return null;

        Player p = new Player(parts[0], parts[1]);
        // 直接设置字段（绕过构造函数默认值）
        try {
            // 用反射或直接 set
            p.setOnline(false);
            p.heal(Integer.parseInt(parts[2]) - p.getHp()); // 恢复保存的 HP

            // 用自定义方式恢复 HP
            int savedHp = Integer.parseInt(parts[2]);
            // 先扣到 0 再加
            while (p.getHp() > 0) p.takeDamage(1);
            p.heal(savedHp);

            p.setCurrentRoom(parts[4]);

            // 恢复物品（简单名字存储，无法完全恢复 Item 对象）
            // 这里保留名字，具体 Item 对象在 GameWorld 中重新创建

            // 恢复武功
            if (!parts[6].equals("-")) {
                for (String kfName : parts[6].split(",")) {
                    KungFu kf = allKungFu.get(kfName.trim());
                    if (kf != null) p.learnKungFu(kf);
                }
            }
        } catch (NumberFormatException e) {
            System.err.println("[PlayerDB] 数据格式错误: " + line);
        }

        return p;
    }
}
