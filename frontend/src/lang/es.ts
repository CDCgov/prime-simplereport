import { LanguageConfig } from "./en";

const YES = "Sí";
const NO = "No";
const OTHER = "Otra";
const REFUSED = "Prefiero no responder";
const UNKNOWN = "Desconocido";
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
      gender: {
        female: "Femenino",
        male: "Masculino",
        other: "Persona no binaria",
        refused: REFUSED,
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
        text:
          "Lo lamentamos, no podemos encontrar la página que busca. Es posible que se haya eliminado, se haya cambiado de nombre o no esté disponible.",
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
          helpText:
            "Usted es responsable de ingresar la información de contacto correcta, siguiendo las leyes federales y estatales aplicables.",
          primaryPhoneNumber: "Número de teléfono principal",
          additionalPhoneNumber: "Número de teléfono adicional",
          phoneType: "Tipo de teléfono",
          addNumber: "Agregar otro número",
          email: "Dirección de correo electrónico",
          country: "País",
          street1: "Dirección 1",
          street2: "Dirección 2",
          county: "Condado",
          city: "Ciudad",
          state: "Estado",
          zip: "Código postal",
        },
        testResultDelivery: {
          text: "",
          receiveTextMessageResults:
            "Sí, envíe un mensaje de texto a todos los números registrados de teléfonos móviles.",
          email: "",
          receiveEmailResults: "",
        },
        demographics: {
          heading: "Información demográfica",
          helpText:
            "Esta información se recopila como parte de los esfuerzos de salud pública para reconocer y abordar la desigualdad en los resultados de salud.",
          race: "Raza",
          tribalAffiliation: "Afiliación tribal",
          ethnicity: "¿Es usted hispano o latino?",
          gender: "Sexo asignado al nacer",
          genderHelpText:
            "Por lo general, este es el género que está escrito en su certificado de nacimiento original.",
        },
        other: {
          heading: "Otro",
          congregateLiving: {
            heading:
              "¿Reside usted en un entorno compartido por muchas personas?",
            helpText:
              "Por ejemplo: hogar de ancianos, hogar comunitario, prisión, cárcel o recinto militar",
          },
          healthcareWorker: "¿Es usted un trabajador de la salud?",
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
            base:
              "Se requiere la fecha de nacimiento, debe estar en formato MM/DD/AA, y en el pasado",
            past: "La fecha de nacimiento está demasiado lejos en el pasado",
            future: "La fecha de nacimiento no puede ser futura",
          },
          telephone: "Falta el número de teléfono o no es válido",
          phoneNumbers: "Faltan los números de teléfono o no son válidos",
          phoneNumbersType: "Se requiere tipo de teléfono",
          phoneNumbersDuplicate: "Número de teléfono duplicado ingresado",
          email: "Falta el correo electrónico o tiene un formato incorrecto",
          street: "Falta el nombre de la calle",
          streetTwo: "Calle 2 tiene un formato incorrecto",
          zipCode: "Falta el código postal o tiene un formato incorrecto",
          state: "Falta el estado o tiene un formato incorrecto",
          city: "La ciudad tiene un formato incorrecto",
          county: "El formato del condado es incorrecto",
          country: "El formato del país es incorrecto",
          race: "La raza tiene un formato incorrecto",
          tribalAffiliation: "La afiliación tribal tiene un formato incorrecto",
          ethnicity: "La etnia tiene un formato incorrecto",
          gender: "El sexo asignado al nacer tiene un formato incorrecto",
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
      form: {
        complete: "Inscripción completa",
        inProgress: "Inscríbase para programar su prueba",
        error: {
          heading: "Error de registro",
          text: "Hubo un error de registro",
        },
      },
      confirmation: {
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
      result: "Resultado de SARS-CoV-2",
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
      specimen: "Identificación de la muestra",
      meaning: "¿Qué significa mi resultado?",
      information:
        "Para obtener más información, visite el <0>sitio web de los Centros para el Control y la Prevención de Enfermedades (CDC)</0> o comuníquese con su departamento de " +
        "salud local.",
      note: "Notas",
      printed: "Resultado de la prueba impreso",
      print: "Imprimir",
      close: "Cerrar",
      testingFacility: {
        details: "Detalles del centro de pruebas",
        name: "Nombre del centro",
        phone: "Teléfono del centro",
        address: "Dirección del centro",
        clia:
          "Número de Enmiendas para Mejoras de Laboratorios Clínicos (CLIA)",
        orderingProvider: "Solicitado por",
        npi: "Identificador de Proveedor Nacional (NPI)",
      },
      notes: {
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
            li0:
              "Quédese en casa cuando esté enfermo, excepto para recibir atención médica.",
            li1:
              "Autoaíslese durante 10 días completos después de que aparezcan los síntomas (o a partir del día siguiente a la realización de la prueba, si no tiene síntomas).",
            li2:
              "Si se autoaísla en su casa, donde viven otras personas, use una habitación y un baño separado para los miembros del grupo familiar que estan enfermos " +
              "(si es posible). Limpie las habitaciones compartidas según sea necesario, para evitar la transmisión del virus",
            li3:
              "Lávese las manos con frecuencia, con agua y jabón, durante al menos 20 segundos, especialmente después de sonarse la nariz, toser o estornudar; después de " +
              "ir al baño y antes de comer o preparar alimentos. ",
            li4:
              "Si no cuenta con agua y jabón, use un desinfectante de manos a base de alcohol que tenga, al menos, un 60 % de alcohol.",
            li5:
              "Tenga un suministro de mascarillas limpias y desechables. Todos, independientemente de su diagnóstico de COVID-19, deben usar mascarillas mientras estén en la " +
              "casa.",
          },
          p2:
            "Esté atento a los síntomas y <0> sepa cuándo buscar atención médica de emergencia</0>. Si alguien presenta alguno de estos síntomas, busque atención médica de " +
            "emergencia de inmediato:",
          whenToSeek: "sepa cuándo buscar atención médica de emergencia",
          symptomsLink:
            "espanol.cdc.gov/coronavirus/2019-ncov/symptoms-testing/symptoms.html",
          emergency: {
            li0: "Dificultad para respirar",
            li1: "Dolor o presión persistente en el pecho",
            li2: "Confusión",
            li3: "Incapacidad de despertarse o permanecer despierto",
            li4: "Labios o cara azulados",
          },
          p3:
            "Llame al 911 o llame primero a su sala de emergencias local: dígale al operador que necesita atención para alguien que tiene o podría tener COVID-19.",
          difficultNewsLink:
            "Obtener un resultado positivo en la prueba de COVID-19 puede ser una noticia difícil, por lo que es importante tomar <0> medidas para sobrellevar el estrés </0> " +
            "durante este periodo<1></1>. Comuníquese con su sistema de apoyo y programe una cita por teléfono o video con un profesional de salud mental si es necesario.",
          difficultNewsURL:
            "espanol.cdc.gov/coronavirus/2019-ncov/daily-life-coping/managing-stress-anxiety.html",
          moreInformation:
            "Para más información: espanol.cdc.gov/coronavirus/2019-ncov/if-you-are-sick/index.html.",
        },
        negative: {
          p0:
            "Comuníquese con su proveedor de atención médica para determinar si es necesario realizar pruebas adicionales, especialmente si tiene alguno de estos síntomas.",
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
      tos: {
        header: "Condiciones del servicio",
        introText:
          "Este centro de pruebas utiliza <0>SimpleReport</0> para gestionar las pruebas de COVID-19 y sus correspondientes notificaciones. Los términos a continuación " +
          "explican las políticas y condiciones del servicio de SimpleReport.",
        consent: "Al aceptar, usted acepta nuestras condiciones del servicio.",
        submit: "Acepto",
        document: {
          intro: {
            p0:
              "Como Centro de Pruebas (Centro) o su usuario (Usuario del Centro) que accede o utiliza SimpleReport (Aplicación) proporcionado por los Centros para el Control " +
              "y la Prevención de Enfermedades (CDC) y el Departamento de Salud y Servicios Humanos (HHS) de los EE. UU., en un entorno de nube de los CDC (“Plataforma de los " +
              "CDC”), usted reconoce y acepta que es el único responsable del cumplimiento de estas Condiciones del Servicio, así como de cualquier sección pertinente de las " +
              "<0>Políticas de Privacidad de los CDC</0> (colectivamente, las Condiciones).",
          },
          scope: {
            heading: "Alcance",
            p0:
              "SimpleReport es una herramienta gratuita que facilita a los centros de pruebas de la enfermedad del coronavirus 2019 (COVID-19) el registro de los resultados de " +
              "las pruebas rápidas en los puntos de atención y la notificación rápida de los datos necesarios a los departamentos de salud pública. Esta Aplicación es " +
              "proporcionada por el HHS y los CDC para permitir que un Centro registre su flujo de trabajo de pruebas, según las necesidades de mantenimiento de registros y " +
              "para enviar los datos de pruebas relevantes y necesarios a las autoridades de salud pública estatales, locales, tribales y territoriales (agencias de salud " +
              "pública estatales, tribales, locales y territoriales) para promover las actividades de respuesta de salud pública relacionadas con el COVID-19. También permite " +
              "al Centro designar a ciertos usuarios de los datos, según se establece en estas Condiciones. La Aplicación a través de la cual interactúa con datos de salud " +
              "pública relevantes está sujeta a estas Condiciones. El uso de la Aplicación constituye la aceptación de estas Condiciones.",
          },
          dataRights: {
            heading: "Derechos y uso de los datos",
            subheading: "Cuentas/Inscripción",
            l0: "Usuarios de los centros en general",
            p0:
              "Si usted utiliza la Aplicación en nombre de un Centro, usted declara y garantiza que tiene autoridad para obligar a ese Centro a cumplir las Condiciones y, al " +
              "aceptarlas, lo hace en nombre de ese Centro (y todas las referencias a “usted” en las Condiciones se refieren a usted y a ese Centro). Para acceder a la " +
              "Aplicación, como parte del proceso de inscripción en la Aplicación, y para su uso continuo de la Aplicación, es posible que deba proporcionar cierta información " +
              "(como identificación o detalles de contacto). Dicha información que proporcione a los CDC o al HHS debe ser precisa y estar actualizada, y debe informarnos de " +
              "inmediato sobre cualquier actualización para que podamos mantenerlo informado sobre cualquier cambio en la Aplicación o en estas Condiciones que pueda afectar " +
              "su uso de la Aplicación. Una vez completadas la inscripción del Centro y la creación de cuentas de Usuario del Centro dentro de la Aplicación, el HHS o los CDC " +
              "le entregarán credenciales (como contraseñas, claves, tokens e identificaciones [ID] del Centro y del Usuario del Centro). Estas credenciales están destinadas a " +
              "ser utilizadas únicamente por usted y para identificar cualquier software o API que esté utilizando. Usted acepta mantener la confidencialidad de sus " +
              "credenciales y realizar los esfuerzos razonables para evitar que otras personas utilicen sus credenciales y disuadirlas para que no lo hagan.",
            l1: "Usuario administrador",
            p1:
              "Una vez completada la inscripción del Centro (y de forma continua, según sea necesario), el Centro debe designar al menos a un usuario del Centro como " +
              "Administrador. Este Administrador tendrá una verificación de identidad más detallada. Una vez que el Administrador haya verificado su identidad, podrá añadir " +
              "otros Usuarios del Centro a la aplicación. El Administrador acepta verificar la identidad de los Usuarios del Centro que se añadan y desactivar a los Usuarios " +
              "del Centro que ya no deban tener acceso. El Administrador también acepta establecer permisos de manera adecuada para determinar el acceso mínimo necesario para " +
              "que los Usuarios del Centro completen sus tareas laborales requeridas.",
          },
          privacy: {
            heading: "Privacidad",
            p0:
              "Usted puede utilizar la Aplicación para buscar, mostrar, analizar, recuperar, visualizar y, en general, “obtener” información de los datos que envía a través " +
              "de la Aplicación y la Plataforma. Tenga en cuenta que los datos que envía a través de la Aplicación pueden estar sujetos a la Ley de Privacidad de 1974, la " +
              "Ley de Portabilidad y Responsabilidad del Seguro Médico (HIPAA) de 1996 y otras leyes, y requiere protección especial. Al acceder y utilizar la Aplicación, " +
              "usted acepta cumplir estrictamente todas las leyes federales y estatales aplicables con respecto a la recolección, el uso, la protección y la divulgación de " +
              "la información obtenida o enviada a través de la Aplicación. Si desea obtener más información sobre la aplicación de la Ley de Privacidad en los CDC, " +
              "<0>haga clic aquí</0>.",
            p1:
              "Para los fines del uso de esta Aplicación, si usted es una entidad cubierta por la HIPAA o actúa en nombre de una como socio comercial o si los datos se " +
              "mantienen en un conjunto de registros designados y cubiertos por la HIPAA, usted reconoce además que cumplirá con la normativa aplicable de la HIPAA " +
              "(Código de Regulaciones Federales [CFR], Título 45, Partes 160 y 164) para los fines de almacenamiento, transmisión, uso y divulgación adecuados de " +
              "cualquier información de salud protegida.",
          },
          useOfData: {
            heading: "Uso de datos",
            p0:
              "Esta Aplicación se proporciona con el fin de permitir el registro del flujo de trabajo de las pruebas de los Centros y las necesidades de mantenimiento de " +
              "registros, y para el envío de los datos relevantes a las agencias de salud pública estatales, tribales, locales y territoriales en apoyo de las actividades " +
              "de respuesta de salud pública relacionadas con la pandemia de COVID-19. El HHS y los CDC reconocen que, si bien los CDC proporcionan la Plataforma, no tienen " +
              "la intención de acceder a los datos ni de revisarlos o analizarlos. Por ello, los CDC no tienen la intención de asumir la custodia o el control de los datos " +
              "enviados a través de la Aplicación. El Usuario del Centro reconoce y acepta que los CDC y los Usuarios Administrativos pueden gestionar los datos enviados a " +
              "través de la Aplicación con el fin de operar la Plataforma de los CDC y transmitir dichos datos a las agencias de salud pública estatales, tribales, locales " +
              "y territoriales, y facilitar su uso. Salvo que lo exija la ley federal aplicable, los CDC no pueden divulgar los datos enviados a través de la Aplicación para " +
              "otros fines que no sean los descritos a continuación. En caso de que se solicite la divulgación de datos a los CDC, los CDC notificarán al solicitante que los " +
              "CDC no tienen acceso a estos datos y remitirán al solicitante al Centro.",
          },
          sharingOfData: {
            heading: "Intercambio de datos",
            p0:
              "Los datos registrados y almacenados en la Aplicación son para que el Centro los utilice según sea necesario para el flujo de trabajo, el mantenimiento de " +
              "registros y el envío de notificaciones. Todos los resultados de las pruebas de COVID-19 se notificarán automáticamente a la agencia de salud pública estatal, " +
              "tribal, local o territorial correspondiente en función tanto del código postal del centro de pruebas como del código postal del paciente, incluidos todos los " +
              "campos relevantes según lo definido en los <0>requisitos de notificación del HHS sobre el COVID-19 para los laboratorios</0>. Al ingresar los resultados que " +
              "se notifican a la agencia de salud pública estatal, tribal, local o territorial, el Centro certifica que está autorizado a notificar los datos a través de la " +
              "Aplicación. Aunque los CDC no accederán activamente a la Aplicación ni obtendrán datos de esta, el Centro, directamente o en coordinación con la agencia de " +
              "salud pública estatal, tribal, local o territorial correspondiente, puede decidir utilizar la Aplicación para enviar datos sin información identificadora a " +
              "los CDC; dichos datos enviados a los CDC se mantendrán de acuerdo con las leyes federales aplicables.",
          },
          otherResponsibilities: {
            heading: "Otras responsabilidades",
            ul: {
              li0:
                "Usted será plenamente responsable de todos los datos que envíe y cooperará con los CDC o sus agentes en caso de que los CDC tengan una inquietud de seguridad " +
                "con respecto a cualquier consulta, envío o recepción de datos hacia o desde los CDC.",
              li1:
                "Informará de inmediato a los CDC en caso de que detecte un uso indebido de la información de salud individualmente identificable o de la información de salud " +
                "protegida que envíe o a la que acceda desde la Plataforma de los CDC.",
              li2:
                "Informará de inmediato a los CDC en caso de que ya no pueda cumplir con cualquiera de las disposiciones establecidas en estas Condiciones.",
              li3:
                "Usted cesará inmediatamente el uso de la Aplicación cuando deje de cumplir cualquiera de los términos de estas Condiciones.",
              li4:
                "Debe cumplir con las medidas de seguridad básicas de escritorio para garantizar la seguridad de cualquier información individualmente identificable o " +
                "información de salud protegida a la que tenga acceso en la Aplicación.",
              li5:
                "Según lo exija la ley aplicable, usted acepta obtener el consentimiento y notificar a las personas cuyos datos se ingresarán en la Aplicación que su " +
                "información personal se recopilará y utilizará con fines de salud pública.",
              li6:
                "Cuando se realicen cambios importantes en la Aplicación o Plataforma (p. ej., la divulgación o los usos de datos hayan cambiado desde la notificación en " +
                "el momento de la recopilación original), se le notificará por medio de un correo electrónico, y usted será responsable de notificar y obtener el " +
                "consentimiento de las personas cuya información de salud protegida o individualmente identificable se encuentre en la Aplicación.",
              li7:
                "En el improbable caso de que se produzca una intromisión que pueda comprometer la seguridad de la información, se deberá notificar a las personas cuya " +
                "información de salud protegida o individualmente identificable se encuentre en la Aplicación y que se vea afectada por dicha intromisión. Los CDC pueden " +
                "ofrecer asistencia para ayudar en este proceso.",
              li8:
                "Usted está obligado a garantizar que cualquier persona que utilice la Aplicación haya recibido capacitación sobre el manejo de información sensible y personal.",
            },
          },
          serviceManagement: {
            heading: "Gestión de servicios",
            subheading: "Derecho a limitar",
            p0:
              "El uso que usted haga de la Aplicación puede estar sujeto a ciertas limitaciones de acceso o uso, tal y como se establece en estas Condiciones o en otras " +
              "disposiciones de los CDC. Estas limitaciones están diseñadas para gestionar la carga en el sistema, promover el acceso equitativo y garantizar la protección " +
              "adecuada de la privacidad, y estas limitaciones pueden ajustarse sin previo aviso, según lo consideren necesario los CDC. Si los CDC consideran razonablemente " +
              "que usted ha intentado sobrepasar o eludir estos límites, su capacidad para utilizar la Aplicación puede ser bloqueada de forma temporal o permanente. Los " +
              "CDC pueden monitorear el uso que usted hace de la Aplicación para mejorar el servicio o para garantizar el cumplimiento de estas Condiciones y se reservan el " +
              "derecho de denegar a cualquier usuario el acceso a la Aplicación a su discreción razonable.",
          },
          serviceTermination: {
            heading: "Cancelación del servicio",
            p0:
              "Si desea cancelar su acceso y uso de la Aplicación, puede hacerlo desactivando su cuenta o absteniéndose de seguir utilizando la Aplicación.",
            p1:
              "Los CDC se reservan el derecho (aunque no la obligación) de (1) negarse a proporcionarle la Aplicación, si los CDC consideran que su uso infringe cualquier ley " +
              "federal o política de los CDC; o (2) cancelar o denegarle el acceso y el uso de la totalidad o parte de la Aplicación en cualquier momento y por cualquier motivo " +
              "que, a entera discreción de los CDC, consideren necesario, incluso para evitar la infracción de la ley federal o la política de los CDC. Puede solicitar a los " +
              "CDC que le vuelvan a dar acceso a la Aplicación a través de la dirección de correo electrónico de soporte proporcionada por los CDC para la Aplicación. Si los " +
              "CDC determinan, a su entera discreción, que ya no existen las circunstancias que dieron lugar a la denegación para proporcionar la Aplicación o cancelar el " +
              "acceso a la Aplicación, entonces los CDC podrán restablecer su acceso. Todas las disposiciones de estas Condiciones, que por su naturaleza deben continuar " +
              "vigentes después de la cancelación, continuarán vigentes después de la cancelación incluidas, sin limitación, las renuncias de garantía y las limitaciones " +
              "de responsabilidad.",
          },
          intellectualProperty: {
            heading:
              "Propiedad intelectual: concesión de licencias y restricciones.",
            p0:
              "La Aplicación proporcionada al Usuario es para su uso. El Usuario no puede modificar, copiar, distribuir, transmitir, mostrar, realizar, reproducir, publicar, " +
              "licenciar, crear trabajos derivados, transferir o vender ninguna información, software, productos o servicios obtenidos de los CDC. El material proporcionado " +
              "por los CDC es propiedad del Departamento de Salud y Servicios Humanos (“HHS”) de los Estados Unidos y de los Centros para el Control y la Prevención de " +
              "Enfermedades (CDC) o está autorizado por estos. El HHS/los CDC le otorgan una licencia limitada, no exclusiva e intransferible para acceder a la Aplicación " +
              "en los Estados Unidos para los usos establecidos en estas Condiciones.",
          },
          disclaimerOfWarranties: {
            heading: "Descargo de responsabilidad de garantía",
            p0:
              "La Plataforma de la Aplicación se proporciona “tal cual” y “según disponibilidad”. Si bien los CDC harán todo lo posible para garantizar que el servicio esté " +
              "disponible y funcione en todo momento, por la presente, los CDC rechazan todas las garantías de cualquier tipo, expresas o implícitas, incluidas, sin " +
              "limitación, las garantías de comercialización, idoneidad para un fin determinado y no infracción. Los CDC no garantizan que los datos estarán libres de " +
              "errores o que el acceso a ellos será continuo o ininterrumpido.",
          },
          limitationOfLiability: {
            heading: "Limitaciones de responsabilidad",
            p0:
              "En ningún caso el HHS o los CDC serán responsables con respecto a cualquier cuestión abordada en estas Condiciones o el uso que usted haga de la Aplicación en " +
              "virtud de cualquier contrato, negligencia, responsabilidad estricta u otra teoría legal o equitativa por (1) cualquier lesión personal, o cualquier daño " +
              "especial, incidental, indirecto o consecuente; (2) el costo de la adquisición de productos o servicios sustitutos; o (3) por pérdida de ganancias, interrupción " +
              "de uso o pérdida o corrupción de datos o cualquier otro daño o pérdida comercial.",
            p1:
              "El HHS y los CDC no son responsables de la confidencialidad ni de ninguna información compartida por el Centro u otro usuario de la Aplicación.",
          },
          disputes: {
            heading:
              "Disputas, elección de derecho aplicable, jurisdicción y conflictos",
            p0:
              "Cualquier disputa que surja de estas Condiciones y del acceso o uso de la Aplicación se regirá por la legislación federal aplicable de los Estados Unidos. " +
              "Asimismo, usted acepta y está de acuerdo con la jurisdicción de los tribunales federales ubicados dentro del Distrito de Columbia y los tribunales de apelación " +
              "de ese lugar, y renuncia a cualquier reclamación de falta de jurisdicción o <em>forum non conveniens.</em>",
          },
          indemnification: {
            heading: "Indemnización",
            p0:
              "Usted acepta indemnizar y eximir de responsabilidad al HHS, incluidos los CDC, sus contratistas, empleados, agentes y similares, de y contra cualquier " +
              "reclamación y gasto, incluidos los honorarios de los abogados, que surjan del uso que usted haga de la Aplicación, lo que incluye, entre otras cosas, la " +
              "infracción de estas Condiciones.",
          },
          noWaiverOfRights: {
            heading: "Sin renuncia a derechos",
            p0:
              "El hecho de que los CDC no ejerzan o hagan valer cualquier derecho o disposición de estas Condiciones no constituirá una renuncia a dicho derecho o disposición.",
          },
          dataAnalytics: {
            heading: "Análisis de datos y métricas de seguimiento",
            p0:
              "Durante el uso de la Aplicación, es posible que se recopilen y almacenen automáticamente ciertos datos generales de análisis sobre los patrones de uso y el " +
              "rendimiento de la Aplicación para ayudar con su diseño y desarrollo. Estos datos de uso general no están vinculados a la identidad de una persona, pero es " +
              "posible que se incluya la dirección IP y la información del dispositivo. Las transacciones se revisan y almacenan para el monitoreo, el rendimiento y la " +
              "resolución de problemas del sitio y pueden estar vinculadas a la persona que realiza una actividad. Estos datos se mantendrán de acuerdo con las leyes " +
              "federales aplicables.",
          },
        },
      },
      dob: {
        dateOfBirth: "Fecha de nacimiento",
        enterDOB: "Ingrese su fecha de nacimiento",
        enterDOB2:
          "Ingrese su fecha de nacimiento para acceder a su portal de pruebas de COVID-19.",
        format: "MM/DD/AAAA",
        invalidFormat:
          "La fecha de nacimiento debe estar en formato MM/DD/AAAA",
        invalidYear:
          "La fecha de nacimiento debe ser posterior a 1900 y anterior al año actual",
        invalidDate: "La fecha de nacimiento debe ser una fecha válida",
        error: "La fecha de nacimiento proporcionada es incorrecta",
        validating: "Validación de la fecha de nacimiento ... ",
        linkExpired:
          "Este enlace ha caducado. Comuníquese con su proveedor de pruebas.",
        linkNotFound:
          "Este enlace de resultado de la prueba no es válido. Vuelva a verificar el enlace o comuníquese con su proveedor de prueba para obtener el enlace correcto.",
        submit: "Continuar",
      },
    },
  },
};
