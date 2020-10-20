// TODO: not currently used

import React, { useState } from "react";

const AddToQueueSearchResultItem = ({ item }) => {
  console.log(item);
  return (
    <div>
      {item.label}
      <a href="#">add to queue</a>
    </div>
  );
};

export default AddToQueueSearchResultItem;
