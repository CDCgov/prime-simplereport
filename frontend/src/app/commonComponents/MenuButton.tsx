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
  disabled?: boolean;
  className?: string;
  items: {
    name: string;
    content?: React.ReactNode;
    action: () => void;
  }[];
  buttonContent: React.ReactNode;
}

export const MenuButton = (props: Props) => (
  <Menu
    menuButton={
      <ReactMenuButton
        id={props.id}
        disabled={props.disabled}
        className={
          props.className ? props.className : "usa-button usa-button--primary"
        }
      >
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
        data-cy={item.name}
      >
        {item.content ?? item.name}
      </MenuItem>
    ))}
  </Menu>
);
