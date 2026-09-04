import { GripVertical } from "lucide-react";
import * as React from "react";
import {
  Group,
  Panel,
  Separator,
  useGroupRef,
  usePanelRef,
} from "react-resizable-panels";

import { cn } from "@/lib/utils";

export type { PanelImperativeHandle } from "react-resizable-panels";

const ResizablePanelGroup = ({
  className,
  direction,
  ...props
}: React.ComponentProps<typeof Group> & {
  direction?: "horizontal" | "vertical";
}) => (
  <Group
    {...props}
    orientation={direction ?? props.orientation ?? "horizontal"}
    className={cn("h-full w-full", className)}
  />
);

const ResizablePanel = Panel;

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof Separator> & {
  withHandle?: boolean;
}) => (
  <Separator
    className={cn(
      "relative -mx-1 flex w-2 cursor-col-resize items-center justify-center bg-transparent hover:bg-border/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[orientation=vertical]:-my-1 data-[orientation=vertical]:mx-0 data-[orientation=vertical]:h-2 data-[orientation=vertical]:w-full data-[orientation=vertical]:cursor-row-resize [&[data-orientation=vertical]>div]:rotate-90",
      className,
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
        <GripVertical className="h-2.5 w-2.5" />
      </div>
    )}
  </Separator>
);

export {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  useGroupRef,
  usePanelRef,
};
