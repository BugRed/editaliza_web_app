import TagData from "@/app/types/TagData";
import styles from "./TagsCardFeed.module.css";

type tagsProps = {
  tags: TagData;
  index?: number;
};

export default function TagsCardFeed({ tags, index = 0 }: tagsProps) {
  return (
    <span className={styles.tagItem}>
      {index > 0 && (
        <span aria-hidden="true" className={styles.separator}>
          ·
        </span>
      )}
      <span className={styles.tagName}>{tags.name}</span>
    </span>
  );
}