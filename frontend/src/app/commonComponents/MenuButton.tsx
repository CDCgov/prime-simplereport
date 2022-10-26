import React from "react";
import {
  Menu,
  MenuButton as ReactMenuButton,
  MenuItem,
} from "@szhsin/react-menu";
import "@szhsin/react-menu/dist/index.css";
import "./MenuButton.scss";

interface Props {
  title?: string;
  id?: string;
  items: {
    name: string;
    content?: React.ReactElement;
    action: () => void;
  }[];
  buttonContent: React.ReactElement;
}

export const MenuButton = (props: Props) => (
  <Menu
    menuButton={
      <ReactMenuButton id={props.id} className="usa-button usa-button--primary">
        {props.buttonContent}
      </ReactMenuButton>
    }
  >
    {props.items.map((item) => (
      <MenuItem
        key={item.name}
        onClick={item.action}
        id={
          props.id
            ? `${item.name.split(" ")[0].toLowerCase()}_${props.id}`
            : undefined
        }
      >
        {item.content ?? item.name}
      </MenuItem>
    ))}
  </Menu>
);
