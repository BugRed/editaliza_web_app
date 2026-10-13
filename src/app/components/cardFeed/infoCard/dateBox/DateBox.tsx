import Style from "./DateBox.module.css";

type DateBoxProps = {
  date?: string | null;
};

export default function DateBox({ date }: DateBoxProps) {
  return (
    <div className={Style.DateContainer}>
      {/* div relativa */}
      <div className={Style.DateBox}>{date}</div>
      {/* Arrow */}
      <div className={Style.DateBoxArrow}></div>
    </div>
  );
}
