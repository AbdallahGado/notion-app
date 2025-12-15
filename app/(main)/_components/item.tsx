"use client";

import { LucideIcon, ChevronRight } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { motion } from "framer-motion";
import styles from "./item.module.css";

interface ItemProps {
  id: Id<"documents">;
  active?: boolean;
  expanded?: boolean;
  level?: number;
  label: string;
  onClick: () => void;
  icon: LucideIcon;
}

export const Item = ({
  id,
  label,
  onClick,
  icon: Icon,
  active,
  level = 0,
  expanded,
}: ItemProps) => {
  return (
    <motion.div
      onClick={onClick}
      tabIndex={0}
      role="button"
      style={{ paddingLeft: level ? `${level * 12 + 12}px` : "9px" }}
      className={styles.itemContainer}
      data-active={active}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      {!!id && (
        <motion.div
          className={styles.chevronContainer}
          animate={{ rotate: expanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className={styles.chevronIcon} />
        </motion.div>
      )}
      <Icon className={styles.itemIcon} />
      <span className={styles.itemLabel}>{label}</span>
    </motion.div>
  );
};
