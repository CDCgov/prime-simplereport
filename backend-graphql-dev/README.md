`npm install && npm run start`

Then navigate to http://localhost:4000

Yeah this is rudimentary at the moment!

## Playing with Devices

1. See all the current devices in your graphql store:

```
{
  device {
    deviceId,
    displayName,
    deviceManufacturer,
    deviceModel,
    isDefault
  }
}
```

2. Add a new device via the `addDevice` mutation:

```
mutation addDevice {
  addDevice(
    deviceId: "device978",
    displayName: "Added via GraphQL",
    deviceManufacturer: "Nobody",
    deviceModel: "Magic",
    isDefault: false
  )
}
```

_note this is so rudimentary that it returns null_

## Playing with Patients

1. See all the current patients in your graphql store:

```
{
  patient {
    patientId,
    firstName,
    middleName,
    lastName,
    birthDate,
    address,
    phone
  }
}
```

2. Add a patient:

```
mutation addPatient {
  addPatient(
    patientId: "patient999",
    firstName: "Added",
    middleName: "Via",
    lastName: "GraphQL",
    birthDate: "01/01/2001",
    address: "600 M ST NW Washington DC USA",
    phone: "555-555-5555"
  )
}
```
