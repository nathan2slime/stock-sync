import {
  ClockCircleOutlined,
  ArrowUpOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { Button, Card, Statistic, Tooltip } from "antd";

const pendingOperationsDescription =
  "These are changes saved on this device while you were offline or the system could not be reached. You can send them when everything is back online";

/**
 * Props for the inventory summary statistics cards.
 */
type ProductInventorySummaryProps = {
  onViewPendingOperations: VoidFunction;
  pendingOperations: number;
  productsCount: number;
};

export const ProductInventorySummary = ({
  onViewPendingOperations,
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
    <Tooltip title={pendingOperationsDescription}>
      <Card className="min-w-56">
        <Statistic
          prefix={<ClockCircleOutlined />}
          title={
            <span className="inline-flex items-center gap-1">
              Pending operations
            </span>
          }
          value={pendingOperations}
        />
        <Button
          block
          className="mt-4"
          icon={<ArrowRightOutlined />}
          onClick={onViewPendingOperations}
        >
          View
        </Button>
      </Card>
    </Tooltip>
  </div>
);
