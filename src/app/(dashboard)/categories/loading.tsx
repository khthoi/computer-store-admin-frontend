import { Skeleton } from "@/src/components/ui/Skeleton";

export default function CategoriesLoading() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton variant="text" width="200px" />
      <Skeleton variant="table-row" count={8} />
    </div>
  );
}
