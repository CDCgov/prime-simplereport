export const facilities = [
  {
    id: "1",
    name: "Facility 1",
    isDeleted: false,
  },
  {
    id: "2",
    name: "Facility 2",
    isDeleted: false,
  },
];

export const facilitiesIncludeArchived = facilities.concat({
  id: "3",
  name: "Facility 3",
  isDeleted: true,
});
