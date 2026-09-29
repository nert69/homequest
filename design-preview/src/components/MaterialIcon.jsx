export default function MaterialIcon({ name, size = 24, style = {} }) {
  return (
    <span
      style={{
        fontFamily: "'Material Symbols Rounded'",
        fontVariationSettings: "'FILL' 1",
        fontSize: size,
        lineHeight: 1,
        ...style,
      }}
    >
      {name}
    </span>
  );
}
