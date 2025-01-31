import { LanguageConfig } from "./en";

const YES = "Sí";
const NO = "No";
const OTHER = "Otra";
const REFUSED = "Prefiero no responder";
const UNKNOWN = "Desconocido";
const NOT_SURE = "No estoy seguro/a";
const POSITIVE = "Positivo";
const NEGATIVE = "Negativo";
const UNDETERMINED = "No concluyente";

export const es: LanguageConfig = {
  translation: {
    header: "Portal de pruebas de COVID-19",
    banner: {
      dotGov: "La terminación .gov significa que el sito es oficial.",
      dotGovHelper:
        "Los sitios web del gobierno federal a menudo terminan en .gov o .mil. Antes de compartir información sensible, asegúrese de que está en un sitio del gobierno federal.",
      secure: "El sitio es seguro.",
      secureHelper:
        "El <0>https://</0> garantiza que se está conectando al sitio web oficial y que cualquier información que proporcione está encriptada y se transmite de forma segura.",
      officialWebsite:
        "Un sitio web oficial del gobierno de los Estados Unidos",
      howYouKnow: "Así es como lo sabe",
    },
    constants: {
      testResults: {
        POSITIVE,
        NEGATIVE,
        UNDETERMINED,
        UNKNOWN,
      },
      testResultsSymbols: {
        POSITIVE: "(+)",
        NEGATIVE: "(-)",
      },
      disease: {
        COVID19: "COVID-19",
        FLUA: "Flu A",
        FLUB: "Flu B",
        FLUAB: "Flu A y B",
        RSV: "VRS",
        HIV: "VIH",
        SYPHILIS: "Sífilis",
        HEPATITIS_C: "Hepatitis C",
        GONORRHEA: "Gonorrea",
        CHLAMYDIA: "Clamdia",
      },
      diseaseResultTitle: {
        COVID19: "COVID-19 resultado",
        FLUA: "Flu A resultado",
        FLUB: "Flu B resultado",
        FLUAB: "Flu A y B resultado",
        RSV: "RSV resultado",
        HIV: "Resultado de la prueba del VIH",
        SYPHILIS: "Sífilis resultado",
        HEPATITIS_C: "Hepatitis C resultado",
        GONORRHEA: "Gonorrea resultado",
        CHLAMYDIA: "Clamdia resultado",
      },
      role: {
        STAFF: "Personal",
        RESIDENT: "Residente",
        STUDENT: "Estudiante",
        VISITOR: "Visitante",
      },
      race: {
        native: "Indoamericana/Nativa de Alaska",
        asian: "Asiática",
        black: "Negra/Afroamericana",
        pacific: "Nativa de Hawái/Otras islas del Pacífico",
        white: "Blanca",
        other: OTHER,
        refused: REFUSED,
      },
      // genderIdentity: {
      //   female: "Femenino",
      //   male: "Masculino",
      //   transwoman: "Transfemenino o mujer transgénero",
      //   transman: "Transmasculino u hombre transgénero",
      //   nonbinary: "No binario o género no conforme",
      //   other: "Identidad de género no está en la lista",
      //   refused: REFUSED,
      // },
      gender: {
        female: "Femenino",
        male: "Masculino",
        // other: "Persona no binaria",
        // refused: REFUSED,
      },
      ethnicity: {
        hispanic: YES,
        not_hispanic: NO,
        refused: REFUSED,
      },
      phoneType: {
        MOBILE: "Móvil",
        LANDLINE: "Línea fija",
      },
      yesNoUnk: {
        YES,
        NO,
        UNKNOWN,
      },
      yesNoNotSure: {
        YES,
        NO,
        NOT_SURE,
      },
      date: {
        month: "Mes",
        day: "Fecha",
        year: "Año",
      },
    },
    languages: {
      English: "Inglés",
      Spanish: "Español",
    },
    common: {
      required: "Los campos obligatorios están marcados con un asterisco",
      defaultDropdownOption: "- Elige -",
      button: {
        submit: "Enviar",
        save: "Guardar cambios",
        saving: "Guardando",
      },
      pageNotFound: {
        heading: "Página no encontrada",
        text: "Lo lamentamos, no podemos encontrar la página que busca. Es posible que se haya eliminado, se haya cambiado de nombre o no esté disponible.",
        errorCode: "​​Código de error: 404",
      },
    },
    address: {
      heading: "Verificación de dirección",
      select: "Por favor, seleccione una opción para continuar",
      useAddress: "Utilice la dirección tal como la ingresó",
      getSuggested: "Utilice la dirección sugerida",
      noSuggestedFound: "No se encontró ninguna dirección sugerida",
      goBack: "Regresar para editar la dirección",
      goBack_plural: "Regresar para editar las direcciones",
      save: "Guardar cambios",
      errors: {
        incomplete: "Elija una dirección o vuelva a editar",
        unverified: "No pudimos verificar la dirección que ingresaste",
        unverified_plural:
          "No pudimos verificar las direcciones que ingresaste",
      },
    },
    facility: {
      form: {
        heading: "Centro de pruebas",
        allFacilities: "Todos los centros de pruebas",
      },
    },
    patient: {
      form: {
        general: {
          heading: "Información general",
          helpText: "Los campos obligatorios están marcados con un asterisco",
          firstName: "Nombre",
          middleName: "Segundo nombre",
          lastName: "Apellido",
          role: "Rol",
          studentId: "Identificación del estudiante",
          preferredLanguage: "Idioma preferido",
          dob: "Fecha de nacimiento",
          dobFormat: "mm/dd/aaaa",
        },
        contact: {
          heading: "Información de contacto",
          phoneHeading: "Teléfono",
          unknownPhoneNumber: "Se desconoce el número de teléfono",
          emailHeading: "Correo electrónico",
          addressHeading: "Dirección",
          unknownAddress:
            "Se desconoce la dirección o el/la paciente no tiene hogar",
          helpText:
            "Usted es responsable de ingresar la información de contacto correcta, siguiendo las leyes federales y estatales aplicables.",
          primaryPhoneNumber: "Número de teléfono principal",
          additionalPhoneNumber: "Número de teléfono adicional",
          phoneType: "Tipo de teléfono",
          addNumber: "Agregar otro número",
          addEmail: "Agregue otra dirección de correo electrónico",
          email: "Dirección de correo electrónico",
          additionalEmail: "Dirección de correo electrónico adicional",
          country: "País",
          street1: "Dirección 1",
          street2: "Dirección 2",
          county: "Condado",
          city: "Ciudad",
          state: "Estado",
          zip: "Código postal",
        },
        testResultDelivery: {
          text: "¿Le gustaría recibir sus resultados por mensaje de texto?",
          receiveTextMessageResults:
            "Sí, envíe un mensaje de texto a todos los números registrados de teléfonos móviles.",
          email:
            "¿Le gustaría recibir los resultados en esta dirección de correo electrónico?",
          email_plural:
            "¿Le gustaría recibir los resultados en estas direcciones de correo electrónico?",
          receiveEmailResults: YES,
        },
        demographics: {
          heading: "Información demográfica",
          helpText:
            "Esta información se recopila como parte de los esfuerzos de salud pública para reconocer y abordar la desigualdad en los resultados de salud.",
          race: "Raza",
          tribalAffiliation: "Afiliación tribal",
          ethnicity: "¿Es usted hispano o latino?",
          gender: "Sexo asignado al nacer",
          // genderIdentity: "¿Cuál es su identidad de género?",
          // genderHelpText:
          //   "Por lo general, este es el género que está escrito en su certificado de nacimiento original.",
        },
        housingAndWork: {
          heading: "Vivienda y trabajo",
          congregateLiving: {
            heading:
              "¿Reside usted en un entorno compartido por muchas personas?",
            helpText:
              "Por ejemplo: hogar de ancianos, hogar comunitario, prisión, cárcel o recinto militar",
          },
          healthcareWorker: "¿Es usted un trabajador de la salud?",
        },
        notes: {
          heading: "Notas",
          helpText:
            "Agregar detalles sobre la ubicación de el/la paciente o información de contacto alternativa.",
        },
        errors: {
          unsaved:
            "“¡Sus cambios aún no están guardados! Haga clic en OK para descartar cambios, Cancelar para continuar con la edición.",
          validationMsg: "Corrija antes de enviar",
          fieldLength: "Esta respuesta es demasiado larga",
          firstName: "Se requiere primer nombre",
          middleName: "El segundo nombre tiene un formato incorrecto",
          lastName: "Se requiere apellido",
          lookupId: "Identificación del estudiante tiene un formato incorrecto",
          role: "Rol tiene un formato incorrecto",
          facilityId: "Se requiere centro de pruebas",
          birthDate: {
            base: "Se requiere la fecha de nacimiento, debe estar en formato MM/DD/AA, y en el pasado",
            past: "La fecha de nacimiento está demasiado lejos en el pasado",
            future: "La fecha de nacimiento no puede ser en el futuro",
          },
          telephone: "Falta el número de teléfono o no es válido",
          phoneNumbers: "Faltan los números de teléfono o no son válidos",
          phoneNumbersType: "Se requiere tipo de teléfono",
          phoneNumbersDuplicate: "Número de teléfono duplicado ingresado",
          email: "El correo electrónico tiene un formato incorrecto",
          street: "Falta el nombre de la calle",
          streetTwo: "Calle 2 tiene un formato incorrecto",
          zipCode: "Falta el código postal o tiene un formato incorrecto",
          zipForState: "El código postal no es válido para este estado",
          state: "Falta el estado o tiene un formato incorrecto",
          city: "Falta la ciudad",
          county: "El formato del condado es incorrecto",
          country: "El formato del país es incorrecto",
          race: "La raza es obligatoria",
          tribalAffiliation: "La afiliación tribal tiene un formato incorrecto",
          ethnicity: "La etnia es obligatoria",
          gender: "El sexo asignado al nacer es obligatorio",
          residentCongregateSetting:
            "¿Reside usted en un entorno compartido por muchas personas?  Se requiere una respuesta",
          employedInHealthcare:
            "¿Es usted un trabajador de la salud? Se requiere una respuesta",
          preferredLanguage: "Idioma preferido tiene un formato incorrecto",
          testResultDelivery: "Mensaje de texto tiene un formato incorrecto",
        },
      },
    },
    selfRegistration: {
      title: "Formulario de inscripción a la prueba",
      form: {
        complete: "Inscripción completa",
        inProgress: "Inscríbase para programar su prueba",
        error: {
          heading: "Error de registro",
          text: "Hubo un error de registro",
        },
      },
      confirmation: {
        title: "Inscripción a la prueba completa",
        registered:
          "<0>{{personName}}</0>, gracias por completar su perfil de paciente en {{entityName}}.",
        checkIn:
          "Cuando llegue para su prueba, regístrese dando su nombre y apellido.",
      },
      duplicate: {
        heading: "Usted ya tiene un perfil en",
        message:
          "Nuestros registros muestran que alguien se ha inscrito con el mismo nombre, fecha de nacimiento y código postal. " +
          "Por favor, comuníquese con el personal de su sitio de pruebas. No necesita inscribirse de nuevo.",
        exit: "Salir de la página de inscripción",
      },
    },
    testResult: {
      title: "Resultado de la prueba",
      singleResultHeader: "Resultado de la prueba",
      multipleResultHeader: "Resultados de las pruebas",
      downloadResult: "Descargar resultado",
      patient: "Paciente",
      patientDetails: "Detalles del paciente",
      name: "Nombre",
      testDetails: "Detalles de la prueba",
      testName: "Nombre de la prueba",
      testResult: "Resultado de la prueba",
      testDate: "Fecha de la prueba",
      positive: POSITIVE,
      negative: NEGATIVE,
      undetermined: UNDETERMINED,
      unknown: UNKNOWN,
      testDevice: "Dispositivo de prueba",
      id: "Número de identificación de la prueba",
      information:
        "Para obtener más información, visite <0>CDC.gov</0> o llame al 1-800-CDC-INFO (1-800-232-4636). Usa la <1>herramienta de verificación del condado</1> (espanol.cdc.gov/coronavirus/2019-ncov/your-health/covid-by-county.html) para comprender su nivel comunitario (riesgo de COVID-19 y capacidad hospitalaria en su área). ), consejos para la prevención y cómo encontrar vacunas, pruebas y recursos de tratamiento. ",
      cdcLink: "https://espanol.cdc.gov/",
      countyCheckToolLink:
        "https://espanol.cdc.gov/coronavirus/2019-ncov/your-health/covid-by-county.html",
      moreInformation: "Más información",
      printed: "Resultado de la prueba impreso",
      print: "Imprimir",
      close: "Cerrar",
      testingFacility: {
        details: "Detalles del centro de pruebas",
        name: "Nombre del centro",
        phone: "Teléfono del centro",
        address: "Dirección del centro",
        clia: "Número de CLIA",
        orderingProvider: "Solicitado por",
        npi: "Número de NPI",
      },
      notes: {
        h1: "Para el COVID-19:",
        meaning:
          "Las pruebas de antígenos de COVID-19 a veces pueden arrojar resultados inexactos o falsos, y es posible que se " +
          "necesiten pruebas de seguimiento. Continúe practicando el distanciamiento social y usando mascarilla. Comuníquese " +
          "con su proveedor de atención médica para determinar si es necesario realizar pruebas adicionales, especialmente si " +
          "tiene alguno de estos síntomas.",
        positive: {
          p1:
            "La mayoría de las personas que contraen COVID-19 pueden recuperarse en casa.  Asegúrese de seguir las directrices de los CDC para las personas que se están " +
            "recuperando en casa y sus cuidadores, por ejemplo:",
          guidelines: {
            li0: "Quédese en casa cuando esté enfermo, excepto para recibir atención médica.",
            li1:
              "Quédate en casa durante 5 días. " +
              "Si no tiene síntomas o sus síntomas se resuelven después de 5 días, puede salir de su casa. " +
              "Continúe usando una máscara alrededor de otras personas durante 5 días adicionales. ",
            li2:
              "Si se autoaísla en su casa, donde viven otras personas, use una habitación y un baño separado para los miembros del grupo familiar que estan enfermos " +
              "(si es posible). Limpie las habitaciones compartidas según sea necesario, para evitar la transmisión del virus",
            li3:
              "Lávese las manos con frecuencia, con agua y jabón, durante al menos 20 segundos, especialmente después de sonarse la nariz, toser o estornudar; después de " +
              "ir al baño y antes de comer o preparar alimentos. ",
            li4: "Si no cuenta con agua y jabón, use un desinfectante de manos a base de alcohol que tenga, al menos, un 60 % de alcohol.",
            li5:
              "Tenga un suministro de mascarillas limpias y desechables. Todos, independientemente de su diagnóstico de COVID-19, deben usar mascarillas mientras estén en la " +
              "casa.",
          },
          p2:
            "Esté atento a los síntomas y sepa cuándo buscar atención médica de emergencia: <0>Síntomas del COVID-19</0> (espanol.cdc.gov/coronavirus/2019-ncov/symptoms-testing/symptoms.html). Si alguien presenta alguno de estos síntomas, busque atención médica de " +
            "emergencia de inmediato:",
          symptomsLink:
            "https://espanol.cdc.gov/coronavirus/2019-ncov/symptoms-testing/symptoms.html",
          emergency: {
            li0: "Dificultad para respirar",
            li1: "Dolor o presión persistente en el pecho",
            li2: "Confusión",
            li3: "Incapacidad de despertarse o permanecer despierto",
            li4: "Labios o cara azulados",
          },
          p3: "Llame al 911 o llame primero a su sala de emergencias local: dígale al operador que necesita atención para alguien que tiene o podría tener COVID-19.",
        },
        negative: {
          p0: "Comuníquese con su proveedor de atención médica para determinar si es necesario realizar pruebas adicionales, especialmente si tiene alguno de estos síntomas.",
          symptoms: {
            li0: "Fiebre o escalofríos",
            li1: "Tos",
            li2: "Falta de aire o dificultad para respirar ",
            li3: "Fatiga",
            li4: "Dolores musculares o corporales",
            li5: "Dolor de cabeza",
            li6: "Pérdida del olfato o el gusto",
            li7: "Dolor de garganta",
            li8: "Congestión o moqueo",
            li9: "Náuseas o vómitos",
            li10: "Diarrea",
          },
          moreInformation:
            "Para obtener más información, por favor visite el sitio web de los <0>Centros para el Control y la Prevención de\n" +
            "Enfermedades (CDC)</0> o comuníquese con su departamento de salud local.",
        },
        inconclusive: {
          p0:
            "Un resultado no concluyente no es ni positivo ni negativo. Esto puede suceder debido a problemas en la recolección de la muestra, porque la infección por el " +
            "virus que causa el COVID-19 se encuentra en una etapa inicial o en el caso de pacientes con COVID-19 que están terminando de recuperarse. Cuando se obtiene un " +
            "resultado no concluyente, se recomienda recolectar y analizar otra muestra.",
          p1:
            "Programe una cita para que le realicen otra prueba lo antes posible. Si se ha realizado la prueba porque tiene síntomas de COVID-19, se recomienda que se " +
            "autoaísle hasta que obtenga los resultados de la nueva prueba.",
        },
      },
      fluNotes: {
        h1: "Para influenza A y B:",
        positive: {
          p0:
            "La mayoría de las personas con influenza (gripe) tienen un caso leve de la enfermedad y se pueden " +
            "recuperar en casa. Quédate en casa y evita el contacto con los demás hasta por lo menos 24 horas " +
            "después de que haya desaparecido la fiebre, excepto para obtener atención médica o para otras " +
            "necesidades. Ponte una mascarilla si sales de casa, o cúbrete con un pañuelo desechable la nariz y la " +
            "boca al toser y estornudar. Lávate las manos con frecuencia.",
          p1:
            "<0>Las personas con un riesgo mayor de presentar complicaciones relacionadas con la influenza</0> " +
            "(https://espanol.cdc.gov/flu/highrisk/index.htm) deben contactar a un médico lo más pronto posible " +
            "para ver si se recomienda el tratamiento antiviral.",
          p2: "Para obtener más información, visita <0>Influenza: qué hacer en caso de enfermarse</0> (https://espanol.cdc.gov/flu/treatment/takingcare.htm).",
          highRiskLink: "https://espanol.cdc.gov/flu/highrisk/index.htm",
          treatmentLink: "https://espanol.cdc.gov/flu/treatment/takingcare.htm",
        },
      },
      rsvNotes: {
        h1: "Para VRS:",
        positive: {
          p0: "Por lo general, el virus respiratorio sincitial (VRS o RSV, por sus siglas en inglés) causa síntomas leves similares a los de un resfriado. La mayoría de las personas pueden recuperarse en casa, pero el VRS puede causar enfermedad grave y hospitalización en bebés y personas mayores. Usted puede ayudar a prevenir la propagación del VRS si se queda en casa cuando esté enfermo, evita el contacto cercano con otras personas y se lava las manos con frecuencia.",
          p1: "Puede tomar medidas para aliviar los síntomas, como beber suficientes líquidos y tomar medicamentos de venta sin receta para controlar el dolor y la fiebre. Si su hijo/a tiene el VRS, hable con su proveedor de atención médica antes de darle medicamentos para el resfriado sin receta.",
          p2: "Comuníquese con un profesional de atención médica si sus síntomas empeoran, tiene problemas para respirar o está deshidratado. <0>Obtenga más información sobre los síntomas y cuidados de la infección por el VRS en el sitio web de los CDC</0> (espanol.cdc.gov/rsv/about/symptoms.html)",
          rsvSymptomsLink: "https://espanol.cdc.gov/rsv/about/symptoms.html",
        },
      },
      hivNotes: {
        h1: "Para el VIH:",
        all: {
          p0: "Si obtiene un resultado positivo, deberá hacerse una prueba de seguimiento para confirmarlo. La organización que realizó su prueba debería poder contestar las preguntas que tenga y proporcionarle remisiones para una prueba de seguimiento.",
          p1: "<0>Visite el sitio web de los CDC para obtener más información sobre un resultado positivo en la prueba del VIH.</0> (cdc.gov/hiv/spanish/basics/hiv-testing/positive-hiv-results.html)",
          positiveHivLink:
            "https://www.cdc.gov/hiv/spanish/basics/hiv-testing/positive-hiv-results.html",
        },
      },
      syphilisNotes: {
        h1: "Para sífilis:",
        positive: {
          p0: "Si obtiene un resultado positivo, deberá hacerse una prueba de seguimiento para confirmarlo. La organización que realizó su prueba debería poder contestar las preguntas que tenga y proporcionarle remisiones para una prueba de seguimiento.",
          p1: "<0>Visite el sitio web de los CDC para obtener más información sobre un resultado positivo en la prueba del sífilis</0> (cdc.gov/std/treatment-guidelines/syphilis.htm).",
          treatmentLink:
            "https://www.cdc.gov/std/treatment-guidelines/syphilis.htm",
        },
      },
      hepatitisCNotes: {
        h1: "Para Hepatitis C:",
        positive: {
          p0: "Si obtiene un resultado positivo, deberá hacerse una prueba de seguimiento para confirmarlo. La organización que realizó su prueba debería poder contestar las preguntas que tenga y proporcionarle remisiones para una prueba de seguimiento.",
          p1: "<0>Visite el sitio web de los CDC para obtener más información sobre un resultado positivo en la prueba del hepatitis C.</0> (cdc.gov/hepatitis-c/testing/index.html#cdc_testing_results-testing-results).",
          treatmentLink:
            "https://www.cdc.gov/hepatitis-c/testing/index.html#cdc_testing_results-testing-results",
        },
      },
      gonorrheaNotes: {
        h1: "Para Gonorrea:",
        positive: {
          p0: "Si obtiene un resultado positivo, deberá hacerse una prueba de seguimiento para confirmarlo. La organización que realizó su prueba debería poder contestar las preguntas que tenga y proporcionarle remisiones para una prueba de seguimiento.",
          p1: "<0>Visite el sitio web de los CDC para obtener más información sobre un resultado positivo de gonorrea.</0> (cdc.gov/gonorrhea/es/about/acerca-de-la-gonorrea.html).",
          treatmentLink:
            "https://www.cdc.gov/gonorrhea/es/about/acerca-de-la-gonorrea.html",
        },
      },
      chlamydiaNotes: {
        h1: "Para Clamidia:",
        positive: {
          p0: "Si obtiene un resultado positivo, deberá hacerse una prueba de seguimiento para confirmarlo. La organización que realizó su prueba debería poder contestar las preguntas que tenga y proporcionarle remisiones para una prueba de seguimiento.",
          p1: "<0>Visite el sitio web de los CDC para obtener más información sobre un resultado positivo de clamidia.</0> (cdc.gov/chlamydia/es/about/acerca-de-las-infecciones-por-clamidia.html).",
          treatmentLink:
            "https://www.cdc.gov/chlamydia/es/about/acerca-de-las-infecciones-por-clamidia.html",
        },
      },
      tos: {
        header: "Condiciones del servicio",
        title: "Condiciones del servicio",
        introText:
          "Este centro de pruebas utiliza <0>SimpleReport</0> para gestionar las pruebas de COVID-19 y sus correspondientes notificaciones. Los términos a continuación " +
          "explican las políticas y condiciones del servicio de SimpleReport.",
        consent: "Al aceptar, usted acepta nuestras condiciones del servicio.",
        submit: "Acepto",
        document: {
          intro: {
            p0: "Como usuario que accede a SimpleReport o que utiliza esta aplicación proporcionada por los Centros para el Control y la Prevención de Enfermedades (CDC) y el Departamento de Salud y Servicios Humanos de los EE. UU. (HHS) en un espacio de la nube de los CDC (“Plataforma de los CDC”), usted reconoce y acepta que es exclusivamente responsable y que cumplirá con estos términos de servicio, así como con todas las secciones relevantes de las <0>políticas de privacidad de los CDC</0> (en su conjunto, los términos).",
          },
          scope: {
            heading: "Alcance",
            p0: "SimpleReport es una herramienta gratuita que les facilita a los establecimientos como centros de atención médica o escuelas registrar y transmitir rápidamente datos de salud pública a los departamentos de salud pública. También les permite a esos establecimientos que habiliten a las personas o los tutores legales para acceder a los resultados relevantes de pruebas y análisis. El HHS y los CDC proporcionan esta aplicación para permitirle a una entidad que registre el flujo de trabajo del ingreso de datos, para mantener registros y para transmitir los datos relevantes y necesarios a las autoridades de salud pública estatales, locales, tribales y territoriales (agencias de salud pública STLT, por sus siglas en inglés) en apoyo a las actividades de vigilancia y respuesta de salud pública. También le permite a la entidad designar a ciertos usuarios de los datos, como se establece en estos términos. La aplicación por medio de la cual la entidad y cualquier usuario interactúe con datos relevantes de salud pública está sujeta a estos términos. El uso de la aplicación constituye la aceptación de estos términos.",
          },
          definitions: {
            heading: "Definiciones",
            l0: {
              title: "Entidad:",
              definition:
                "Un proveedor o establecimiento de atención médica; un lugar donde se hagan pruebas; una autoridad de salud pública estatal, local, tribal o territorial (agencia de salud pública STLT); u otra institución que esté inscrita en SimpleReport y la use para registrar o transmitir datos.",
            },
            l1: {
              title: "Usuario:",
              definition:
                "Una persona cuyos datos personales se estén notificando vía SimpleReport (usuario individual) o una persona autorizada para actuar en nombre de la entidad bajo estos términos (usuario de una entidad o administrador de una entidad). SimpleReport solo designará a un usuario de la entidad como el administrador de la entidad. Los administradores de entidades tendrán una verificación de identidad más detallada que los usuarios generales de las entidades. Una vez que se haya verificado la identidad del administrador de la entidad, esta persona podrá añadir a otros usuarios de la entidad o usuarios individuales a la aplicación. A efectos de estos términos, todas las funciones se denominan como las de un “usuario”, a menos que se indique lo contrario.",
            },
          },
          dataRights: {
            heading: "Derechos y uso de los datos",
            subheading: "Cuentas/inscripción",
            section0: "Para los usuarios de entidades",
            p01: "Si usted está usando la aplicación en nombre de una entidad, como administrador o como usuario, usted declara y garantiza que tiene la autoridad para hacer que esa entidad cumpla con los términos, y al aceptar los términos lo hace en nombre de esa entidad (y cada mención de “usted” en los términos se refiere a usted y esa entidad).",
            p02: "Para acceder a la aplicación, como parte del proceso de inscripción y para continuar usándola, es probable que se le pida que proporcione cierta información (como los detalles de identificación o contacto). Toda esa información que usted dé a los CDC o el HHS debe ser correcta y estar actualizada. Debe informarnos con prontitud sobre cualquier cambio y actualizar su información en la aplicación o escribir a <0>support@simplereport.gov</0>, para que podamos mantenerlo informado de cualquier cambio en la aplicación o en estos términos que podrían afectar su uso de la aplicación. Es probable que usemos la información de contacto que usted proporcione para comunicarnos con respecto a la facilidad de uso, a fin de mejorar el producto y el servicio. Después de la inscripción de la entidad y la creación de cuentas de usuarios de una entidad en la aplicación, el HHS o los CDC le proporcionarán credenciales (como contraseñas, claves, identificadores e identificaciones para la entidad y los usuarios de la identidad). Estas credenciales son para que solo usted las use y para identificar cualquier software o interfaz de programación (API, por sus siglas en inglés) que usted esté usando. Usted acepta mantener sus credenciales de manera confidencial y hacer lo razonablemente posible para prevenir y desalentar que otras personas usen sus credenciales.",
            section1: "Para los administradores de entidades",
            p1: "El administrador de una entidad acepta verificar la identidad de otros usuarios de la entidad que sean agregados y desactivar las cuentas de otros usuarios de la entidad que ya no deberían tener acceso. El administrador también acepta establecer los permisos adecuadamente para determinar el acceso mínimo necesario para cada usuario de la entidad, a fin de que puedan cumplir con los deberes requeridos en su puesto de trabajo.",
            section2: "Para los usuarios individuales",
            p2: "Los administradores de la entidad les darán a los usuarios individuales acceso a la aplicación. Los usuarios individuales pueden usar la aplicación para acceder y revisar su propia información o la información de otras personas, según lo permitan las leyes vigentes (p. ej., en nombre de un menor o como tutor legal).  Como se ha mencionado, todos los usuarios deben aceptar y cumplir con estos términos una vez que se hayan inscrito y usen la aplicación.",
          },
          privacy: {
            heading: "Privacidad",
            p0: "Usted puede usar la aplicación para buscar, exhibir, analizar, recuperar, visualizar u ‘obtener’ la información de los datos que esté enviando (o, para los usuarios individuales, de los datos que se les envíen) por medio de la aplicación y la plataforma. Note que los datos a los que usted acceda, registre o transmita por medio de la aplicación podrían estar sujetos a la Ley de Portabilidad y Responsabilidad del Seguro Médico de 1996 (HIPAA) y otras leyes y requiere protección especial. Al acceder a la aplicación y usarla, usted acepta obedecer estrictamente todas las leyes federales y estatales aplicables con respecto a la recolección, el uso, la protección y la divulgación de la información obtenida o enviada por medio de la aplicación. Debido a que podría haber usuarios individuales que acceden a la información en nombre de un menor o como tutores legales, los usuarios y administradores de una entidad se comprometen a asumir toda la responsabilidad de señalar la información de contacto correcta de los usuarios individuales en la aplicación, según las leyes correspondientes. Si desea más información sobre la aplicación de la Ley de Privacidad en los CDC, visite el <0>sitio web del Departamento de Salud y Servicios Humanos</0>.",
            p1: "A efectos del uso de esta aplicación, si su entidad está cubierta por la HIPAA, usted está actuando en nombre de una entidad de esas características como socio de negocios o usted mantiene los datos en un registro designado cubierto por la HIPAA, usted reconoce, asimismo, que cumplirá con las regulaciones de la HIPAA aplicables (45 CFR, partes 160 y 164), relacionadas con el almacenamiento, la transmisión, el uso y la divulgación adecuados de toda información de salud protegida.",
          },
          useOfData: {
            heading: "Uso de los datos",
            p0: "Esta aplicación se proporciona para permitir el registro de los datos de la entidad, respaldar el flujo de trabajo de la entidad, mantener registros y transmitir datos relevantes a las agencias de salud pública STLT en apoyo a las actividades de vigilancia y respuesta de salud pública. El HHS y los CDC reconocen que, si bien los CDC proporcionan la plataforma, los CDC no pretenden acceder a los datos, ni revisarlos o analizarlos. De esta manera, los CDC no pretenden asumir la custodia ni el control de los datos enviados por medio de la aplicación. Los usuarios individuales y de una entidad reconocen y aceptan que los CDC y los usuarios administrativos pueden gestionar los datos enviados por medio de la aplicación a efectos de operar la plataforma de los CDC (lo que incluye verificar la identidad de los usuarios), transmitir los datos a las agencias de salud pública STLT y facilitarles su uso.  Con excepción de lo que requieran las leyes federales aplicables, los CDC no podrán divulgar los datos enviados por medio de la aplicación para fines que no sean los que se describen a continuación.",
          },
          sharingOfData: {
            heading: "Divulgación de los datos",
            p0: "Los datos que la entidad haya registrado y almacenado en la aplicación son para el uso de la entidad, según las necesidades del flujo de trabajo, el mantenimiento de registros y la notificación. Los datos que la entidad haya registrado y almacenado en la aplicación se transmitirán automáticamente a la agencia de salud pública STLT correspondiente, según el código postal de la entidad y del paciente, lo que incluye, para los resultados de las pruebas de detección de la enfermedad del coronavirus 2019, el contenido de todas las casillas relevantes, según la definición del <0>HHS con respecto a los requisitos de notificación de COVID-19 para los laboratorios.</0> Al ingresar los resultados que se estén transmitiendo a las agencias o a las agencias de salud pública STLT correspondientes, la entidad atestigua que está autorizada para reportar los datos por medio de la aplicación. Si bien los CDC no accederán a los datos ni los obtendrán activamente de la aplicación, la entidad, de forma directa o en coordinación con la agencia de salud pública STLT correspondiente, podría decidir usar la aplicación para enviar datos sin información de identificación personal o de otro tipo, según lo determine la entidad, a los CDC; esos datos enviados a los CDC se mantendrán según lo indiquen las leyes federales aplicables.",
          },
          otherResponsibilities: {
            heading: "Otras responsabilidades",
            ul: {
              preheading1: "Para todos los usuarios:",
              li0: "Usted será plenamente responsable de todos los datos que envíe y cooperará con los CDC o sus agentes en caso de que los CDC tengan una inquietud de seguridad con respecto a cualquier pedido, envío o recepción de datos hacia o desde los CDC.",
              li1: "Informará con prontitud a los CDC en caso de que detecten el uso indebido de información de salud identificable a nivel individual o información de salud protegida que usted envíe o a la que tenga acceso en la plataforma de los CDC.",
              li2: "Informará con prontitud a los CDC en caso de que ya no pueda cumplir con alguna de las disposiciones establecidas en estos términos.",
              li3: "Cesará inmediatamente el uso de la aplicación cuando ya no cumpla con alguno de los términos aquí establecidos.",
              preheading2: "Para los administradores y usuarios de entidades:",
              li4: "Debe cumplir con las medidas básicas de seguridad en computación para garantizar la seguridad de toda información de identificación personal o información de salud protegida a la que tenga acceso en la aplicación.",
              li5: "Debido a que podrían requerirlo las leyes aplicables, usted está de acuerdo con obtener el consentimiento de las personas cuyos datos se ingresen a la aplicación y notificarlas de que su información personal será recolectada y usada para fines de salud pública.",
              li6: "Cuando se hagan grandes cambios a la aplicación o la plataforma (p. ej., cuando la divulgación o los usos de los datos hayan cambiado desde la notificación que se hizo en la recolección original), se lo notificará por correo electrónico y usted será responsable de notificar y obtener el consentimiento de las personas cuya información de identificación personal o información de salud protegida esté en la aplicación.",
              li7: "En la eventualidad poco probable de una intrusión, usted deberá notificar a las personas cuya información de identificación personal o información de salud protegida esté en la aplicación y hayan sido afectadas. Los CDC podrían ofrecer asistencia para ayudar en este proceso.",
              li8: "Se requiere que usted garantice que cualquier persona que use la aplicación haya sido capacitada en el manejo de información sensible y personal.",
            },
          },
          serviceManagement: {
            heading: "Administración del servicio",
            subheading: "Derecho a establecer límites",
            p0: "Su uso de la aplicación podría estar sujeto a ciertas limitaciones en el acceso o uso, según se establece en estos términos o estipulen los CDC. Estas limitaciones tienen como objetivo administrar la carga del sistema, fomentar el acceso equitativo y garantizar las protecciones de privacidad adecuadas, y podrían modificarse sin aviso, según los CDC consideren necesario. Si los CDC tienen la creencia razonable de que usted ha intentado exceder o eludir estos límites, su capacidad de usar la aplicación podría ser impedida de forma temporal o permanente. Los CDC podrían monitorear su uso de la aplicación, para mejorar el servicio o garantizar el cumplimiento de estos términos, y se reservan el derecho de negar a cualquier usuario el acceso a la aplicación, según un criterio razonable.",
          },
          serviceTermination: {
            heading: "Cancelación del servicio",
            p0: "Si desea cancelar su acceso a la aplicación y su uso, puede hacerlo al desactivar su cuenta (por ejemplo, comunicándose con el administrador de su entidad) o al dejar de usar la aplicación.",
            p1: "Los CDC se reservan el derecho (pero no la obligación) de hacer lo siguiente: (1) negarse a proporcionarle a usted la aplicación, si en opinión de los CDC ese uso viola alguna ley federal o las políticas de los CDC; o (2) poner fin o negarle a usted el acceso y el uso de la aplicación como un todo o parte de ella, en cualquier momento y por cualquier motivo que, según su criterio exclusivo, los CDC consideren necesario, incluso para prevenir la violación de leyes federales o políticas de los CDC. Usted puede presentar una solicitud a los CDC para recuperar el acceso a la aplicación, usando la dirección de correo electrónico de apoyo que los CDC proporcionan para la aplicación. Si los CDC determinan, según su criterio exclusivo, que las circunstancias que llevaron a la negación de proporcionarle la aplicación o a la cancelación del acceso a la aplicación ya no existen, entonces los CDC podrían restaurar su acceso. Todas las disposiciones en estos términos que, por su naturaleza, deberían perdurar después de la cancelación del servicio, perdurarán después de la cancelación del servicio, incluso, sin limitación, los descargos de responsabilidad de garantías y las delimitaciones de responsabilidades.",
          },
          intellectualProperty: {
            heading:
              "Propiedad intelectual. Otorgamiento de licencias y restricciones.",
            p0: "La aplicación que se le provee al usuario es para uso del usuario. El usuario no podrá modificar, copiar, distribuir, transmitir, exhibir, hacer funcionar, reproducir, publicar, autorizar con licencias, transferir ni vender información, software, productos o servicios obtenidos de los CDC ni crear obras derivadas de ellos. Los materiales proporcionados por los CDC son propiedad o están autorizados bajo licencia del Departamento de Salud y Servicios Humanos de los Estados Unidos (“HHS”) y los Centros para el Control y la Prevención de Enfermedades (CDC). El HHS y los CDC le otorgan a usted una licencia limitada, no exclusiva y no transferible para acceder a la aplicación en los Estados Unidos para los usos que se establecen en estos términos.",
          },
          disclaimerOfWarranties: {
            heading: "Descargo de responsabilidad de garantías",
            p0: "La plataforma de la aplicación se proporciona “en su estado actual” y “con base en su disponibilidad”. Si bien los CDC harán todo lo posible para garantizar que el servicio esté disponible y en funcionamiento en todo momento, por medio del presente los CDC hacen un descargo de responsabilidad de garantías de cualquier tipo, expresas o implícitas, incluidas, sin limitación, las garantías de comerciabilidad, aptitud para un propósito específico y no infracción. Los CDC no dan ninguna garantía de que los datos estarán libres de errores o de que el acceso a ellos será continuo o ininterrumpido.",
          },
          limitationOfLiability: {
            heading: "Delimitaciones de la responsabilidad",
            p0: "En la medida que lo permita la ley, el HHS y los CDC no serán responsables con respecto a ninguno de los temas de estos términos o del uso que usted haga de la aplicación bajo ningún contrato, negligencia, responsabilidad estricta u otra teoría legal o equitativa, con respecto a lo siguiente: (1) cualquier lesión personal o cualquier daño especial, casual, indirecto o consiguiente; (2) el costo de la adquisición de productos o servicios de remplazo; (3) la pérdida de ganancias, la interrupción del uso o la pérdida o corrupción de datos, o cualquier otro daño o pérdida comercial.",
            p1: "El HHS y los CDC no son responsables de la confidencialidad o cualquier información que la entidad u otro usuario de la aplicación divulgue.",
          },
          disputes: {
            heading:
              "Disputas, selección de jurisdicción y tribunales, y conflictos",
            p0: "Toda disputa que surja de estos términos y del acceso a la aplicación o su uso deberá ser dirimida según las leyes federales aplicables de los Estados Unidos. Asimismo, usted acepta y da su consentimiento con respecto a la jurisdicción de los tribunales federales en el Distrito de Columbia y los tribunales de apelación allí ubicados, y renuncia a todo reclamo de falta de jurisdicción o <em>forum non conveniens</em> (jurisdicción inapropiada).",
          },
          indemnification: {
            heading: "Indemnización",
            p0: "Usted acepta indemnizar y eximir de toda responsabilidad al HHS, incluidos los CDC, sus contratistas, empleados, agentes y semejantes con respecto a todo reclamo y gasto, incluidos los honorarios de abogados, que surjan del uso que usted haga de la aplicación, incluida la violación de estos términos, pero sin limitarse a ello.",
          },
          noWaiverOfRights: {
            heading: "Ninguna renuncia de derechos",
            p0: "Que los CDC dejen de ejercer o hacer cumplir algún derecho o disposición incluido en estos términos no significará que renuncia a ese derecho o disposición.",
          },
          dataAnalytics: {
            heading: "Análisis de datos y métrica de monitoreo",
            p0: "Al usar la aplicación, se podrían recolectar y almacenar automáticamente ciertos análisis generales de datos sobre los patrones de uso y el funcionamiento de la aplicación, con el fin de ayudar en su diseño y desarrollo. Estos datos generales del uso no están vinculados a la identidad de una persona, pero se podrían incluir la dirección IP y la información del dispositivo. Las transacciones se auditan y almacenan para el monitoreo, funcionamiento y resolución de problemas del sitio, y podrían estar vinculadas a la persona que realiza la actividad. Todos los datos de ese tipo se mantendrán según lo indiquen las leyes federales aplicables.",
          },
        },
      },
      dob: {
        title: "Verificación del resultado de la prueba",
        header: "Acceda al resultado de su prueba de COVID-19",
        dateOfBirth: "Fecha de nacimiento",
        enterDOB: "Ingrese su fecha de nacimiento",
        enterDOB2:
          "Ingrese la fecha de nacimiento de <0>{{personName}}</0> para acceder a su resultado de pruebas de COVID-19.",
        linkExpirationNotice:
          "Nota: este enlace vencerá el <0>{{expirationDate}}</0>. ",
        testingFacilityContact:
          "Por favor comuníquese con <0>{{facilityName}}</0> al <1>{{facilityPhone}}</1> si tiene problemas para acceder a su resultado.",
        format: "MM/DD/AAAA",
        invalidFormat:
          "La fecha de nacimiento debe estar en formato MM/DD/AAAA",
        invalidYear:
          "La fecha de nacimiento debe ser posterior a 1900 y anterior al año actual",
        invalidDate: "La fecha de nacimiento debe ser una fecha válida",
        error: "La fecha de nacimiento proporcionada es incorrecta",
        validating: "Validación de la fecha de nacimiento ... ",
        linkExpired:
          "Este enlace ha caducado. Comuníquese con su proveedor de prueba para generar un nuevo enlace.",
        linkNotFound:
          "Este enlace de resultado de la prueba no es válido. Vuelva a verificar el enlace o comuníquese con su proveedor de prueba para obtener el enlace correcto.",
        exampleText: "Por ejemplo: 4 28 1986",
        submit: "Continuar",
      },
    },
  },
};
