export default function ghostButton({ onClickFunction, text, icon, style, }) {
    return (
      <>
        <button className="btn btn-ghost justify-start" onClick={onClickFunction} style={style}>
          <i className={icon}></i>
          <p className={style}> {text}</p>
        </button>
      </>
    );
  }