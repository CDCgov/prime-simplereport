import React from "react";
import {
  Menu,
  MenuButton as ReactMenuButton,
  MenuItem,
} from "@szhsin/react-menu";
import "@szhsin/react-menu/dist/index.css";
import "./ActionsMenu.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";

interface Props {
  title?: string;
  id?: string;
  items: {
    name: string;
    content?: React.ReactElement;
    action: () => void;
  }[];
}

export const MenuButton = (props: Props) => (
  <Menu
    menuButton={
      <ReactMenuButton id={props.id} className="usa-button usa-button--primary">
        <span className={"margin-right-1"}>Add patients</span>
        <FontAwesomeIcon icon={faCaretDown} />
      </ReactMenuButton>
    }
  >
    {props.items.map((item) => (
      <MenuItem
        key={item.name}
        onClick={item.action}
        className="sr-menu-item"
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
