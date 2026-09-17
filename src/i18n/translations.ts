export type Language = 'en' | 'am' | 'om';

export interface TranslationDictionary {
  appName: string;
  appSubtitle: string;
  roles: {
    admin: string;
    doctor: string;
    nurse: string;
    receptionist: string;
    lab_tech: string;
    cashier: string;
    monitor: string;
  };
  nav: {
    dashboard: string;
    patients: string;
    triage: string;
    doctorDesk: string;
    labPortal: string;
    billing: string;
    queueMonitor: string;
    analytics: string;
  };
  common: {
    search: string;
    save: string;
    cancel: string;
    submit: string;
    edit: string;
    delete: string;
    print: string;
    status: string;
    actions: string;
    date: string;
    loading: string;
    online: string;
    offline: string;
    syncPending: string;
    allSynced: string;
    refresh: string;
    close: string;
  };
  patient: {
    mrn: string;
    fullName: string;
    gender: string;
    age: string;
    phone: string;
    address: string;
    bloodType: string;
    allergies: string;
    chronicConditions: string;
    emergencyContact: string;
    registerPatient: string;
    newPatient: string;
    searchPlaceholder: string;
    noPatientsFound: string;
  };
  triage: {
    title: string;
    subtitle: string;
    bp: string;
    temp: string;
    pulse: string;
    respRate: string;
    height: string;
    weight: string;
    bmi: string;
    painScore: string;
    priority: string;
    chiefComplaint: string;
    recordVitals: string;
    urgent: string;
    emergency: string;
    normal: string;
  };
  doctor: {
    title: string;
    callNext: string;
    inConsultation: string;
    soapNotes: string;
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
    icd10Lookup: string;
    prescribeMed: string;
    orderLab: string;
    completeConsultation: string;
    pastVitals: string;
    drugAllergyWarning: string;
  };
  lab: {
    title: string;
    pendingOrders: string;
    collectSample: string;
    enterResults: string;
    testName: string;
    parameter: string;
    result: string;
    unit: string;
    refRange: string;
    abnormal: string;
    printReport: string;
    completedOrders: string;
  };
  billing: {
    title: string;
    invoiceNumber: string;
    totalAmount: string;
    paymentMethod: string;
    cash: string;
    telebirr: string;
    cbeBirr: string;
    insurance: string;
    markAsPaid: string;
    printReceipt: string;
    thermalReceipt: string;
    amountPaid: string;
    reference: string;
    statusPaid: string;
    statusPending: string;
  };
  queue: {
    waitingRoomMonitor: string;
    nowCalling: string;
    ticketNumber: string;
    room: string;
    doctor: string;
    waitingCount: string;
    recentlyCalled: string;
  };
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    appName: 'Haramaya University Referral Hospital',
    appSubtitle: 'Hiwot Fana Comprehensive Specialized Hospital',
    roles: {
      admin: 'Clinic Director (Admin)',
      doctor: 'Doctor / GP',
      nurse: 'Triage Nurse',
      receptionist: 'Receptionist',
      lab_tech: 'Lab Technologist',
      cashier: 'Cashier & Billing',
      monitor: 'Waiting Room TV',
    },
    nav: {
      dashboard: 'Dashboard',
      patients: 'Patient Registry',
      triage: 'Triage Desk',
      doctorDesk: 'Doctor Clinical Desk',
      labPortal: 'Laboratory',
      billing: 'Cashier & Billing',
      queueMonitor: 'Waiting Room TV',
      analytics: 'Reports & Analytics',
    },
    common: {
      search: 'Search...',
      save: 'Save Record',
      cancel: 'Cancel',
      submit: 'Submit',
      edit: 'Edit',
      delete: 'Delete',
      print: 'Print Document',
      status: 'Status',
      actions: 'Actions',
      date: 'Date',
      loading: 'Loading data...',
      online: 'Online (Connected)',
      offline: 'Offline Mode (Local Storage)',
      syncPending: 'sync pending',
      allSynced: 'All records synced',
      refresh: 'Refresh',
      close: 'Close',
    },
    patient: {
      mrn: 'Medical Record No. (MRN)',
      fullName: 'Full Name',
      gender: 'Gender',
      age: 'Age (Years)',
      phone: 'Phone Number',
      address: 'Address / Kebele',
      bloodType: 'Blood Type',
      allergies: 'Known Drug Allergies',
      chronicConditions: 'Chronic Conditions',
      emergencyContact: 'Emergency Contact',
      registerPatient: 'Register New Patient',
      newPatient: 'New Patient',
      searchPlaceholder: 'Search by MRN, Name, or Phone...',
      noPatientsFound: 'No patients found in database.',
    },
    triage: {
      title: 'Nurse Triage Station',
      subtitle: 'Record initial vital signs and assign priority tickets',
      bp: 'Blood Pressure (mmHg)',
      temp: 'Temperature (°C)',
      pulse: 'Pulse Rate (bpm)',
      respRate: 'Resp. Rate (/min)',
      height: 'Height (cm)',
      weight: 'Weight (kg)',
      bmi: 'Body Mass Index (BMI)',
      painScore: 'Pain Score (0 - 10)',
      priority: 'Triage Priority Level',
      chiefComplaint: 'Chief Complaint & Symptoms',
      recordVitals: 'Save Vitals & Queue Patient',
      urgent: 'Urgent',
      emergency: 'Emergency',
      normal: 'Normal',
    },
    doctor: {
      title: 'Doctor Clinical Consultation Desk',
      callNext: 'Call Next Patient',
      inConsultation: 'Active Consultation',
      soapNotes: 'SOAP Clinical Documentation',
      subjective: 'S - Subjective (History & Complaints)',
      objective: 'O - Objective (Physical Exam Findings)',
      assessment: 'A - Assessment (ICD-10 Diagnosis)',
      plan: 'P - Plan (Treatment & Advice)',
      icd10Lookup: 'Search ICD-10 Standard Diagnostic Code',
      prescribeMed: 'Add E-Prescription Medication',
      orderLab: 'Order Diagnostic Lab Test',
      completeConsultation: 'Complete Visit & Sign',
      pastVitals: 'Latest Triage Vitals',
      drugAllergyWarning: 'CRITICAL ALLERGY ALERT: Patient is allergic to',
    },
    lab: {
      title: 'Diagnostic Laboratory Workbench',
      pendingOrders: 'Active Laboratory Orders',
      collectSample: 'Mark Sample Collected',
      enterResults: 'Enter Test Results',
      testName: 'Test Name',
      parameter: 'Parameter',
      result: 'Result Value',
      unit: 'Unit',
      refRange: 'Reference Range',
      abnormal: 'Abnormal Flag',
      printReport: 'Print Official Lab Report',
      completedOrders: 'Completed Lab Tests',
    },
    billing: {
      title: 'Cashier Desk & Itemized Billing',
      invoiceNumber: 'Invoice #',
      totalAmount: 'Total Payable (ETB)',
      paymentMethod: 'Payment Channel',
      cash: 'Cash',
      telebirr: 'Telebirr (Ethio Telecom)',
      cbeBirr: 'CBE Birr',
      insurance: 'Medical Insurance',
      markAsPaid: 'Confirm Payment & Print Receipt',
      printReceipt: 'Print 80mm Thermal Receipt',
      thermalReceipt: '80mm Thermal POS Receipt',
      amountPaid: 'Amount Paid (ETB)',
      reference: 'Transaction Ref / Approval #',
      statusPaid: 'PAID',
      statusPending: 'PENDING',
    },
    queue: {
      waitingRoomMonitor: 'Waiting Room Live Display',
      nowCalling: 'NOW CALLING',
      ticketNumber: 'Ticket #',
      room: 'Consultation Room',
      doctor: 'Doctor',
      waitingCount: 'Patients in Waiting Area',
      recentlyCalled: 'Recently Called',
    },
  },
  am: {
    appName: 'ሃረማያ ዩኒቨርሲቲ ሪፈራል ሆስፒታል',
    appSubtitle: 'ህይወት ፋና አጠቃላይ ስፔሻላይዝድ ሆስፒታል',
    roles: {
      admin: 'የክሊኒክ ዳይሬክተር (አድሚን)',
      doctor: 'ዶክተር / ሀኪም',
      nurse: 'ትሪያጅ ነርስ',
      receptionist: 'መስተንግዶ (ሪሴፕሽን)',
      lab_tech: 'የላብራቶሪ ባለሙያ',
      cashier: 'ገንዘብ ተቀባይ / ሂሳብ',
      monitor: 'የተጠባባቂ ክፍል ቲቪ',
    },
    nav: {
      dashboard: 'ዳሽቦርድ',
      patients: 'የታካሚዎች መዝገብ',
      triage: 'የትሪያጅ ክፍል',
      doctorDesk: 'የሀኪም የህክምና ክፍል',
      labPortal: 'ላብራቶሪ',
      billing: 'ክፍያ እና ሂሳብ',
      queueMonitor: 'የተጠባባቂ ክፍል ቲቪ',
      analytics: 'ሪፖርቶች እና ትንታኔ',
    },
    common: {
      search: 'ፈልግ...',
      save: 'መዝግብ',
      cancel: 'ሰርዝ',
      submit: 'አስገባ',
      edit: 'አስተካክል',
      delete: 'አጥፋ',
      print: 'ሰነድ አትም',
      status: 'ሁኔታ',
      actions: 'ድርጊቶች',
      date: 'ቀን',
      loading: 'መረጃ በመጫን ላይ...',
      online: 'ኦንላይን (የተገናኘ)',
      offline: 'ከመስመር ውጭ (ያለ ኢንተርኔት)',
      syncPending: 'ያልተመሳሰሉ',
      allSynced: 'ሁሉም መረጃዎች ተመሳስለዋል',
      refresh: 'አድስ',
      close: 'ዝጋ',
    },
    patient: {
      mrn: 'የህክምና መዝገብ ቁጥር (MRN)',
      fullName: 'ሙሉ ስም',
      gender: 'ጾታ',
      age: 'እድሜ',
      phone: 'ስልክ ቁጥር',
      address: 'አድራሻ / ቀበሌ',
      bloodType: 'የደም አይነት',
      allergies: 'የመድሃኒት አለርጂዎች',
      chronicConditions: 'ስር የሰደዱ በሽታዎች',
      emergencyContact: 'የአደጋ ጊዜ ተጠሪ',
      registerPatient: 'አዲስ ታካሚ መዝግብ',
      newPatient: 'አዲስ ታካሚ',
      searchPlaceholder: 'በMRN፣ ስም ወይም ስልክ ፈልግ...',
      noPatientsFound: 'ምንም የተመዘገበ ታካሚ አልተገኘም።',
    },
    triage: {
      title: 'የነርስ ትሪያጅ ጣቢያ',
      subtitle: 'የመጀመሪያ ደረጃ የህይወት ምልክቶችን መዝግብ እና ቅድሚያ መድብ',
      bp: 'የደም ግፊት (mmHg)',
      temp: 'የሰውነት ሙቀት (°C)',
      pulse: 'የልብ ምት (bpm)',
      respRate: 'የመተንፈስ ፍጥነት (/ደቂቃ)',
      height: 'ቁመት (ሳ.ሜ)',
      weight: 'ክብደት (ኪ.ግ)',
      bmi: 'የሰውነት ክብደት መረጃ (BMI)',
      painScore: 'የህመም መጠን (0 - 10)',
      priority: 'የትሪያጅ ቅድሚያ ደረጃ',
      chiefComplaint: 'ዋናው የህመም ስሜትና ምልክቶች',
      recordVitals: 'መዝግብና ወደ ተራ አስገባ',
      urgent: 'አስቸኳይ',
      emergency: 'እጅግ ድንገተኛ',
      normal: 'መደበኛ',
    },
    doctor: {
      title: 'የሀኪም የህክምና እና ምርመራ ክፍል',
      callNext: 'ቀጣዩን ታካሚ ጥራ',
      inConsultation: 'በምርመራ ላይ ያለ ታካሚ',
      soapNotes: 'የSOAP የህክምና ማስታወሻ',
      subjective: 'S - የታካሚው የህመም ታሪክ',
      objective: 'O - የአካል ምርመራ ውጤት',
      assessment: 'A - የበሽታ መመርመሪያ (ICD-10)',
      plan: 'P - የህክምና እቅድ እና ምክር',
      icd10Lookup: 'የICD-10 የበሽታ ኮድ ፈልግ',
      prescribeMed: 'ዲጂታል የመድሃኒት ማዘዣ ጻፍ',
      orderLab: 'የላብራቶሪ ምርመራ እዘዝ',
      completeConsultation: 'ህክምናውን አጠናቅቅና ፈርም',
      pastVitals: 'የትሪያጅ የህይወት ምልክቶች',
      drugAllergyWarning: 'ማስጠንቀቂያ! ታካሚው በዚህ መድሃኒት ላይ አለርጂ አለበት፦',
    },
    lab: {
      title: 'የላብራቶሪ ምርመራ የስራ ክፍል',
      pendingOrders: 'የታዘዙ የላብ ምርመራዎች',
      collectSample: 'ናሙና ተወስዷል',
      enterResults: 'የምርመራ ውጤት አስገባ',
      testName: 'የምርመራው ስም',
      parameter: 'መለኪያ',
      result: 'የውጤት መጠን',
      unit: 'መለኪያ አሃድ',
      refRange: 'መደበኛ ወሰን',
      abnormal: 'ከተለመደው ውጭ የሆነ',
      printReport: 'ይፋዊ የላብራቶሪ ውጤት አትም',
      completedOrders: 'የተጠናቀቁ ምርመራዎች',
    },
    billing: {
      title: 'የገንዘብ ተቀባይ እና ሂሳብ ክፍል',
      invoiceNumber: 'የደረሰኝ ቁጥር #',
      totalAmount: 'ጠቅላላ ክፍያ (ብር)',
      paymentMethod: 'የክፍያ መንገድ',
      cash: 'ጥሬ ገንዘብ (Cash)',
      telebirr: 'ቴሌብር (Telebirr)',
      cbeBirr: 'ሲቢኢ ብር (CBE Birr)',
      insurance: 'የህክምና መድን (ኢንሹራንስ)',
      markAsPaid: 'ክፍያ አረጋግጥና ደረሰኝ አትም',
      printReceipt: 'የ80ሚ.ሜ ቴርማል ደረሰኝ አትም',
      thermalReceipt: 'የ80ሚ.ሜ ቴርማል ደረሰኝ',
      amountPaid: 'የተከፈለ መጠን (ብር)',
      reference: 'የግብይት መለያ ቁጥር (Ref #)',
      statusPaid: 'ተከፍሏል',
      statusPending: 'ያልተከፈለ',
    },
    queue: {
      waitingRoomMonitor: 'የተጠባባቂ ክፍል የቀጥታ ስክሪን',
      nowCalling: 'አሁን የሚጠራ',
      ticketNumber: 'የተራ ቁጥር',
      room: 'የምርመራ ክፍል',
      doctor: 'ሀኪም',
      waitingCount: 'በመጠባበቅ ላይ ያሉ ታካሚዎች',
      recentlyCalled: 'በቅርብ የተጠሩ',
    },
  },
  om: {
    appName: 'Hospitaala Yuunivarsiitii Haramayaa',
    appSubtitle: 'Hospitaala Ispeeshaalaayizdii Hiwoot Faanaa',
    roles: {
      admin: 'Daayirektara Kiliiniikaa (Admin)',
      doctor: 'Ogeessa Yaalaa / Doktora',
      nurse: 'Narsii Tiriyaajii',
      receptionist: 'Keessummeessituu',
      lab_tech: 'Ogeessa Laaboraatorii',
      cashier: 'Qabduu Maallaqaa / Kaffaltii',
      monitor: 'TV Kutaa Eeggannaa',
    },
    nav: {
      dashboard: 'Daashboordii',
      patients: 'Galmee Dhukkubsattootaa',
      triage: 'Kutaa Tiriyaajii',
      doctorDesk: 'Kutaa Qorannoo Doktoraa',
      labPortal: 'Laaboraatorii',
      billing: 'Kaffaltii & Nagahee',
      queueMonitor: 'TV Kutaa Eeggannaa',
      analytics: 'Gabaasaalee & Xiinxala',
    },
    common: {
      search: 'Barbaadi...',
      save: 'Galmeessi',
      cancel: 'Haqi',
      submit: 'Galchi',
      edit: 'Sirreessi',
      delete: 'Balleessi',
      print: 'Nagahee Maxxansi',
      status: 'Haala',
      actions: 'Gochaalee',
      date: 'Guyyaa',
      loading: 'Feʼamaa jira...',
      online: 'Onlaayinii (Kan walqabate)',
      offline: 'Oflaayinii (Interneetii Malee)',
      syncPending: 'Kan hin walqabanne',
      allSynced: 'Hundi walitti hidhameera',
      refresh: 'Haaromsi',
      close: 'Cufi',
    },
    patient: {
      mrn: 'Lakkoofsa Galmee Yaalaa (MRN)',
      fullName: 'Maqaa Guutuu',
      gender: 'Korniyaa',
      age: 'Umrii (Waggaa)',
      phone: 'Lakkoofsa Bilbilaa',
      address: 'Teessoo / Ganda',
      bloodType: 'Gosa Dhiigaa',
      allergies: 'Alarjii Qorichaa',
      chronicConditions: 'Dhukkuba Turaa',
      emergencyContact: 'Nama Yeroo Balaa',
      registerPatient: 'Dhukkubsataa Haaraa Galmeessi',
      newPatient: 'Dhukkubsataa Haaraa',
      searchPlaceholder: 'MRN, Maqaa ykn Bilbilaan barbaadi...',
      noPatientsFound: 'Dhukkubsataan hin argamne.',
    },
    triage: {
      title: 'Tiriyaajii Narsii',
      subtitle: 'Mallattoolee lubbuu duraa galmeessi fi dursi kenni',
      bp: 'Dhiibbaa Dhiigaa (mmHg)',
      temp: 'Hoʼa Qaamaa (°C)',
      pulse: 'Rukuttaa Onnee (bpm)',
      respRate: 'Hafuura Baafannaa (/daqiiqaa)',
      height: 'Dheerina (cm)',
      weight: 'Ulfaatina (kg)',
      bmi: 'Ulfaatina Qaamaa (BMI)',
      painScore: 'Sadarkaa Dhukkubbii (0 - 10)',
      priority: 'Sadarkaa Dursi Tiriyaajii',
      chiefComplaint: 'Iyyata Dhukkubaa fi Mallattoolee',
      recordVitals: 'Galmeessi gara Tarree Dabarsi',
      urgent: 'Ariifachiisaa',
      emergency: 'Balaan Yeroo',
      normal: 'Idilee',
    },
    doctor: {
      title: 'Kutaa Qorannoo fi Yaala Doktoraa',
      callNext: 'Dhukkubsataa Itti Aanu Waami',
      inConsultation: 'Yaalamaa Jira',
      soapNotes: 'Yaada Yaalaa SOAP',
      subjective: 'S - Seenaa Dhukkubbii',
      objective: 'O - Qorannoo Qaamaa',
      assessment: 'A - Dhukkuba Adda Baasuu (ICD-10)',
      plan: 'P - Karoora Yaalaa fi Gorsa',
      icd10Lookup: 'Koodii ICD-10 Barbaadi',
      prescribeMed: 'Qoricha Barreessi',
      orderLab: 'Qorannoo Laaboraatorii Ajaji',
      completeConsultation: 'Yaala Xumuri fi Mallatteessi',
      pastVitals: 'Mallattoolee Lubbuu Tiriyaajii',
      drugAllergyWarning: 'Akeekkachiisa! Dhukkubsataan alarjii qoricha kana qaba:',
    },
    lab: {
      title: 'Hojii Laaboraatorii',
      pendingOrders: 'Ajaja Laaboraatorii',
      collectSample: 'Saamuda Fudhadhu',
      enterResults: 'Buʼaa Qorannoo Galchi',
      testName: 'Maqaa Qorannoo',
      parameter: 'Safartuu',
      result: 'Buʼaa',
      unit: 'Yuuniitii',
      refRange: 'Hanga Idilee',
      abnormal: 'Idilee Kan Hin Taane',
      printReport: 'Gabaasa Laaboraatorii Maxxansi',
      completedOrders: 'Qorannoowwan Xumuraman',
    },
    billing: {
      title: 'Kaffaltii fi Nagahee',
      invoiceNumber: 'Lakkoofsa Nagahee #',
      totalAmount: 'Kaffaltii Waliigalaa (Qarshii)',
      paymentMethod: 'Mala Kaffaltii',
      cash: 'Qarshii Callaa (Cash)',
      telebirr: 'Telebirr (Itoophiyaa Telekoom)',
      cbeBirr: 'CBE Birr',
      insurance: 'Inshuraansii Fayyaa',
      markAsPaid: 'Kaffaltii Mirkaneessi & Maxxansi',
      printReceipt: 'Nagahee Teermaalaa 80mm Maxxansi',
      thermalReceipt: 'Nagahee POS Teermaalaa 80mm',
      amountPaid: 'Kaffalame (Qarshii)',
      reference: 'Lakkoofsa Mirkaneeffannaa (Ref #)',
      statusPaid: 'Kaffalameera',
      statusPending: 'Harka Jira',
    },
    queue: {
      waitingRoomMonitor: 'Agarsiisa TV Kutaa Eeggannaa',
      nowCalling: 'AMMA WAAMAMAA JIRA',
      ticketNumber: 'Lakkoofsa Tarree',
      room: 'Kutaa Yaalaa',
      doctor: 'Doktora',
      waitingCount: 'Dhukkubsattoota Eegaa Jiran',
      recentlyCalled: 'Dhiyeenya Kan Waamaman',
    },
  },
};
