import { Typography } from "antd";

/**
 * Props for table cell text with consistent ellipsis handling.
 */
type ProductTableCellTextProps = {
  value: number | string;
};

export const ProductTableCellText = ({ value }: ProductTableCellTextProps) => {
  const text = String(value);

  return (
    <Typography.Text className="block max-w-full" ellipsis={{ tooltip: text }}>
      {text}
    </Typography.Text>
  );
};
