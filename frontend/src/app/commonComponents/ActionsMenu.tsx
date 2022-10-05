import React from "react";
import { Menu, MenuButton, MenuItem } from "@szhsin/react-menu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisH } from "@fortawesome/free-solid-svg-icons";
import "@szhsin/react-menu/dist/index.css";
import "./ActionsMenu.scss";

interface Props {
  title?: string;
  id?: string;
  items: {
    name: string;
    action: () => void;
  }[];
}

export const ActionsMenu = (props: Props) => (
  <Menu
    menuButton={
      <MenuButton
        className="sr-actions-menu"
        id={props.id ? `action_${props.id}` : undefined}
      >
        <FontAwesomeIcon icon={faEllipsisH} size="2x" />
        <span className="usa-sr-only">{props.title ?? "More actions"}</span>
      </MenuButton>
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
        {item.name}
      </MenuItem>
    ))}
  </Menu>
);
