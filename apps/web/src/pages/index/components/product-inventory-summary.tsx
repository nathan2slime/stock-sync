import { ClockCircleOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { Card, Statistic } from "antd";

/**
 * Props for the inventory summary statistics cards.
 */
type ProductInventorySummaryProps = {
  pendingOperations: number;
  productsCount: number;
};

export const ProductInventorySummary = ({
  pendingOperations,
  productsCount,
}: ProductInventorySummaryProps) => (
  <div className="flex flex-wrap justify-center gap-4 lg:justify-end">
    <Card className="min-w-56">
      <Statistic
        prefix={<ArrowUpOutlined />}
        title="Products created"
        value={productsCount}
      />
    </Card>
    <Card className="min-w-56">
      <Statistic
        prefix={<ClockCircleOutlined />}
        title="Pending operations"
        value={pendingOperations}
      />
    </Card>
  </div>
);
