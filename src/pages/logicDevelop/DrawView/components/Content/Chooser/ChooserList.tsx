import React, { useState } from "react";
import { Collapse, Popover } from "antd";
import { nodeConfigrationList } from "../../../store/params";
import { drag, dragEnd } from "../../../tools/drag";

interface ChooserListProps {
  searchText: string;
}

const activeKeys = nodeConfigrationList.map((d) => d.id);

export default function ChooserList(props: ChooserListProps): JSX.Element {
  const [activeKey, setActiveKey] = useState(activeKeys);
  const { searchText } = props;
  return (
    <div className="draw-chooser">
      <Collapse
        bordered={false}
        activeKey={activeKey}
        onChange={(v: string[]) => setActiveKey(v)}
      >
        {nodeConfigrationList.map(({ id, name, list }) => {
          return (
            <Collapse.Panel header={name} key={id}>
              <div className="draw-chooser-list">
                {(list as any[])
                  .filter(
                    (d: any) => d.name.search(new RegExp(searchText || "", "i")) > -1
                  )
                  .map(({ id, name, iconCls, description }) => {
                    const cls = "draw-nodeItem-icon " + (iconCls || "");
                    return (
                      <Popover
                        content={description}
                        placement="right"
                        overlayClassName="draw-popover"
                        mouseEnterDelay={1}
                        key={id}
                      >
                        <div
                          className="draw-nodeItem"
                          draggable={true}
                          onDragStart={(e: React.DragEvent<HTMLDivElement>) =>
                            drag(e, id)
                          }
                          onDragEnd={dragEnd}
                          onDragExit={dragEnd}
                        >
                          <i className={cls} />
                          <div className="draw-nodeItem-text">{name}</div>
                        </div>
                      </Popover>
                    );
                  })}
              </div>
            </Collapse.Panel>
          );
        })}
      </Collapse>
    </div>
  );
}
