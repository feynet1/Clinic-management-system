import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getQueueTickets } from '../services/dataService';
import type { QueueTicket } from '../types';
import {
  Activity,
  Stethoscope,
  Clock,
  ShieldCheck,
  Tv,
  LogIn,
  Search,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  PhoneCall,
  MapPin,
  HeartPulse,
  FlaskConical,
  CreditCard,
  Globe,
  Sparkles,
  Bed,
  Users,
  Award,
  Calendar,
  Star,
  Ambulance,
  Building2,
  ExternalLink,
  GraduationCap
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (route: 'home' | 'login' | 'app' | 'queue') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { language, setLanguage, session } = useApp();

  // Queue ticket lookup state for waiting hall patients
  const [ticketSearch, setTicketSearch] = useState('');
  const [searchedTicket, setSearchedTicket] = useState<QueueTicket | null>(null);
  const [searchStatus, setSearchStatus] = useState<'idle' | 'searching' | 'found' | 'not_found'>('idle');

  const content = {
    en: {
      hospitalName: 'Haramaya University Referral Hospital',
      hospitalSub: 'Hiwot Fana Comprehensive Specialized University Hospital',
      tagline: 'College of Health & Medical Sciences • Harar, Ethiopia',
      preTitle: 'Tertiary Referral & Teaching Hospital in Eastern Ethiopia',
      heroTitle: 'Excellence in Clinical Care,',
      heroAccent: 'Medical Training & Research.',
      heroDesc:
        'Serving over 5.8 million people across the Harari Region, Eastern Oromia, Dire Dawa, and Somali Regional State. Equipped with comprehensive emergency trauma care, national oncology center, pediatric ICU, and digital clinical operations.',
      ctaStaff: session ? 'Open Clinical Workspace' : 'Staff Portal Sign In',
      ctaTV: 'Live Waiting Room TV Display',
      socialProof: 'Over 1,200 daily patients served with 4.9/5 satisfaction rating',
      phoneHotline: '(025) 666-0368',
      mobileEmergency: '+251 915 046 933',
      labPhone: '+251 25 666 7439',
      address: 'Caffe Street, Jinela Woreda, Harar, Ethiopia (P.O. Box 235)',
      
      aboutBadge: 'Why Choose Hiwot Fana',
      aboutTitle: 'Compassionate care that puts patients and families first',
      aboutDesc:
        'Established under the legacy of Haramaya University, Hiwot Fana Comprehensive Specialized Hospital bridges cutting-edge academic medicine with everyday patient healing. With over 60 years of university heritage, our multidisciplinary clinical specialists, resident physicians, and emergency response teams provide patient-centered healthcare around the clock.',
      
      features: [
        { title: '24/7 Tertiary Emergency & Trauma', desc: 'Rapid resuscitation unit, advanced adult & pediatric ICUs, and ambulance dispatch.' },
        { title: 'Modern Inpatient Facility', desc: 'Comprehensive medical wards, expanding to a 960+ bed university hospital complex.' },
        { title: 'Advanced Laboratory & Pathology', desc: 'Automated clinical chemistry, hematology, microbiology, and molecular diagnostics.' },
        { title: 'National Oncology & Cancer Center', desc: 'One of Ethiopias five designated tertiary cancer diagnostic and therapy centers.' },
      ],
      
      servicesTitle: 'Specialized Clinical Departments & Centers',
      servicesSubtitle: 'Tertiary referral and inpatient services supporting Eastern Ethiopia',
      
      services: [
        {
          title: 'Emergency & Critical Care Medicine',
          desc: 'Round-the-clock emergency triage, trauma resuscitation, adult and pediatric ICUs with dedicated critical care specialists.',
          badges: ['24/7 Trauma Desk', 'Adult ICU', 'Resuscitation'],
          icon: <Ambulance className="w-6 h-6 text-rose-500" />,
          img: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
        },
        {
          title: 'Internal Medicine & Oncology Center',
          desc: 'Specialized medical sub-specialties including Cardiology, Nephrology, Infectious Disease, and Eastern Ethiopias primary Oncology Unit.',
          badges: ['Oncology Ward', 'Cardiology', 'Endocrine'],
          icon: <Stethoscope className="w-6 h-6 text-brand-500" />,
          img: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
        },
        {
          title: 'Pediatrics & Child Health (NICU)',
          desc: 'Dedicated pediatric emergency unit, specialized Neonatal Intensive Care Unit (NICU), kangaroo mother care, and child malnutrition clinic.',
          badges: ['Neonatal ICU', 'Immunization', 'Child Wellness'],
          icon: <HeartPulse className="w-6 h-6 text-emerald-500" />,
          img: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
        },
        {
          title: 'Gynecology & Obstetrics Center',
          desc: 'High-risk pregnancy management, specialized labor & delivery suites, 63+ bed maternity ward, and maternal wellness clinics.',
          badges: ['Maternal Ward', 'Safe Motherhood', 'Fetal Medicine'],
          icon: <ShieldCheck className="w-6 h-6 text-purple-500" />,
          img: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=800&q=80',
        },
        {
          title: 'Surgery, Orthopedics & Traumatology',
          desc: 'Major operative theaters for elective and emergency procedures, orthopedic fracture repair, neurosurgery, and laparoscopy.',
          badges: ['Operative Suites', 'Traumatology', 'Post-Op Ward'],
          icon: <Activity className="w-6 h-6 text-sky-500" />,
          img: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80',
        },
        {
          title: 'Diagnostic Laboratory & Imaging',
          desc: 'Fully automated biochemistry analyzers, CBC hematology, blood bank, digital X-Ray, CT imaging, and ultrasound diagnostics.',
          badges: ['Automated Analysers', 'Blood Bank', 'CT & Ultrasound'],
          icon: <FlaskConical className="w-6 h-6 text-amber-500" />,
          img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
        },
      ],

      stats: [
        { num: '60+', label: 'Years of University Heritage' },
        { num: '5.8M+', label: 'Population Catchment Area' },
        { num: '960+', label: 'Target Inpatient Beds' },
        { num: '1,200+', label: 'Daily Outpatient Visits' },
      ],

      checkQueueTitle: 'Live Patient Queue Status Lookup',
      checkQueueDesc: 'Check your real-time waiting position and room assignment by entering your ticket number (e.g., Q-101, Q-326).',
      ticketPlaceholder: 'e.g. Q-101 or Q-326',
      trackBtn: 'Check Status',

      teamTitle: 'Meet Our Clinical Leadership & Specialists',
      teamDesc: 'Committed healthcare professionals and academic faculty delivering compassionate care',
      team: [
        { name: 'Dr. Selamawit Tadesse', role: 'Chief Clinical Director (CCD)', dept: 'Hospital Administration & Public Health', img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80' },
        { name: 'Dr. Henok Bekele', role: 'Consultant Physician & Internist', dept: 'Department of Internal Medicine', img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80' },
        { name: 'Dr. Yonas Tesfaye', role: 'Consultant Surgeon & Traumatologist', dept: 'Department of Surgery & Orthopedics', img: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80' },
        { name: 'Sr. Bethelhem Girma', role: 'Head Nurse & Triage Director', dept: 'Emergency & Triage Operations', img: 'https://images.unsplash.com/photo-1594824813589-940028e3b5e4?auto=format&fit=crop&w=400&q=80' },
      ],

      ctaBannerTitle: 'Need Emergency Medical Attention or Referral?',
      ctaBannerDesc: 'Our triage team and emergency department operate 24 hours a day, 7 days a week for trauma, surgical, and medical emergencies.',
      ctaCallNow: 'Call Emergency Desk',
      ctaTVDisplay: 'Launch Waiting Room TV Display',
      emergencyHours: '24/7 Emergency & ICU • Outpatient Clinics: Mon-Sat 8:00 AM – 6:00 PM',
    },
    am: {
      hospitalName: 'ሃረማያ ዩኒቨርሲቲ ሪፈራል ሆስፒታል',
      hospitalSub: 'ህይወት ፋና አጠቃላይ ስፔሻላይዝድ ዩኒቨርሲቲ ሆስፒታል',
      tagline: 'የጤና እና ህክምና ሳይንስ ኮሌጅ • ሐረር፣ ኢትዮጵያ',
      preTitle: 'በምስራቅ ኢትዮጵያ ቀዳሚ የሪፈራል እና የማስተማሪያ ሆስፒታል',
      heroTitle: 'የላቀ የህክምና አገልግሎት፣',
      heroAccent: 'የህክምና ስልጠና እና ምርምር።',
      heroDesc:
        'የሐረሪ ክልል፣ የምስራቅ ኦሮሚያ፣ የድሬዳዋ እና የሶማሌ ክልል ነዋሪዎችን (ከ5.8 ሚሊዮን በላይ ህዝብ) የሚያገለግል። የድንገተኛ አደጋ ህክምና፣ የካንሰር ማዕከል፣ የህፃናት አይሲዩ እና ዘመናዊ ዲጂታል የክሊኒክ ስራ አመራር።',
      ctaStaff: session ? 'ወደ ህክምና ክፍል ግባ' : 'የሰራተኞች መግቢያ',
      ctaTV: 'የጥበቃ ክፍል የቲቪ ስክሪን',
      socialProof: 'በየቀኑ ከ1,200 በላይ ታካሚዎችን በ4.9/5 እርካታ እናገለግላለን',
      phoneHotline: '(025) 666-0368',
      mobileEmergency: '+251 915 046 933',
      labPhone: '+251 25 666 7439',
      address: 'ጫፌ መንገድ፣ ጅኔላ ወረዳ፣ ሐረር፣ ኢትዮጵያ (ፖ.ሳ.ቁ 235)',

      aboutBadge: 'ለምን ህይወት ፋና ሆስፒታል?',
      aboutTitle: 'ለታካሚዎች እና ለቤተሰቦቻቸው ቅድሚያ የሚሰጥ ሩህሩህ አገልግሎት',
      aboutDesc:
        'በሃረማያ ዩኒቨርሲቲ የጤና እና ህክምና ሳይንስ ኮሌጅ ስር የሚገኘው ህይወት ፋና ሆስፒታል፣ ዘመናዊ የህክምና እውቀትን ከሰው አክባሪነት ጋር አቀናጅቶ ይሰጣል። ከ60 ዓመታት በላይ ባለው የዩኒቨርሲቲ ታሪክ፣ ስፔሻሊስት ሀኪሞቻችንና ነርሶቻችን ሌት ተቀን የህክምና ድጋፍ ያደርጋሉ።',

      features: [
        { title: 'የ24 ሰዓት የድንገተኛ አደጋ እና ትራውማ', desc: 'የፅኑ ህሙማን ማቆያ (ICU)፣ የህፃናት ህክምና እና አምቡላንስ አገልግሎት።' },
        { title: 'ዘመናዊ የታካሚዎች አልጋ ማዕከል', desc: 'ከ960 በላይ አልጋዎችን የሚይዝ አዲስ ግዙፍ የሆስፒታል ህንፃ ግንባታ።' },
        { title: 'የላቀ ላብራቶሪ እና ፓቶሎጂ', desc: 'ራስ-ሰር የደም እና የኬሚካል መመርመሪያ መሳሪያዎች፣ የማይክሮባዮሎጂ ምርመራ።' },
        { title: 'ብሔራዊ የካንሰር እና ኦንኮሎጂ ማዕከል', desc: 'በሀገሪቱ ካሉ 5 የካንሰር ህክምና ማዕከላት አንዱ።' },
      ],

      servicesTitle: 'ስፔሻላይዝድ የህክምና ክፍሎች',
      servicesSubtitle: 'ለመላው ምስራቅ ኢትዮጵያ የተሟላ የሪፈራል እና የተኝቶ ህክምና አገልግሎት',

      services: [
        {
          title: 'ድንገተኛ አደጋ እና ፅኑ ህክምና (ICU)',
          desc: 'የ24 ሰዓት የድንገተኛ ህክምና፣ የአዋቂ እና የህፃናት አይሲዩ (ICU) እንዲሁም የትራውማ ማዕከል',
          badges: ['24/7 ድንገተኛ', 'አይሲዩ (ICU)', 'አምቡላንስ'],
          icon: <Ambulance className="w-6 h-6 text-rose-500" />,
          img: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
        },
        {
          title: 'የውስጥ ደዌ እና የካንሰር ማዕከል',
          desc: 'የልብ፣ የኩላሊት፣ የስኳር እና የምስራቅ ኢትዮጵያ ዋነኛ የካንሰር (ኦንኮሎጂ) ህክምና ክፍል',
          badges: ['የካንሰር ማዕከል', 'የልብ ህክምና', 'የስኳር ክሊኒክ'],
          icon: <Stethoscope className="w-6 h-6 text-brand-500" />,
          img: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
        },
        {
          title: 'የህፃናት ጤና እና የጨቅላ ህፃናት አይሲዩ (NICU)',
          desc: 'የጨቅላ ህፃናት ከፍተኛ ማቆያ (NICU)፣ የክትባት እና የተመጣጠነ ምግብ እጥረት ህክምና ክፍል',
          badges: ['ጨቅላ ህፃናት NICU', 'ክትባት', 'የህፃናት ጤና'],
          icon: <HeartPulse className="w-6 h-6 text-emerald-500" />,
          img: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
        },
        {
          title: 'የማህፀን እና የፅንስ ህክምና',
          desc: 'ከፍተኛ ጥንቃቄ የሚያስፈልጋቸው እርግዝናዎች ክትትል፣ የወሊድ ክፍል እና ከ63 በላይ አልጋዎች ያሉት የማህፀን ህክምና ዋርድ',
          badges: ['የወሊድ ክፍል', 'የእናትነት ክትትል', 'ማህፀን ህክምና'],
          icon: <ShieldCheck className="w-6 h-6 text-purple-500" />,
          img: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=800&q=80',
        },
        {
          title: 'ቀዶ ህክምና እና ኦርቶፔዲክስ (አጥንት)',
          desc: 'ዘመናዊ የቀዶ ጥገና ክፍሎች፣ የአጥንት ስብራት እና የድንገተኛ አደጋ ቀዶ ህክምናዎች',
          badges: ['ቀዶ ጥገና', 'የአጥንት ህክምና', 'ትራውማ'],
          icon: <Activity className="w-6 h-6 text-sky-500" />,
          img: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80',
        },
        {
          title: 'የላቦራቶሪ እና የምስል ምርመራ (CT, X-Ray)',
          desc: 'ራስ-ሰር የኬሚስትሪ እና ሄማቶሎጂ መመርመሪያዎች፣ የደም ባንክ፣ ዲጂታል ኤክስሬይ እና አልትራሳውንድ',
          badges: ['ዘመናዊ ላብራቶሪ', 'የደም ባንክ', 'ሲቲ ስካን እና ኤክስሬይ'],
          icon: <FlaskConical className="w-6 h-6 text-amber-500" />,
          img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
        },
      ],

      stats: [
        { num: '60+', label: 'የዩኒቨርሲቲው አንጋፋ ቅርስ (ዓመታት)' },
        { num: '5.8 ሚ+', label: 'የህዝብ ተጠቃሚነት ሽፋን' },
        { num: '960+', label: 'በግንባታ ላይ ያሉ የተኝቶ አልጋዎች' },
        { num: '1,200+', label: 'ዕለታዊ የተመላላሽ ታካሚዎች' },
      ],

      checkQueueTitle: 'የታካሚውን የተራ ቁጥር ይከታተሉ',
      checkQueueDesc: 'ከመቀበያ የተሰጠዎትን የተራ ቁጥር (ምሳሌ፡ Q-101 ወይም Q-326) በማስገባት ተራዎን እና ክፍልዎን ይወቁ።',
      ticketPlaceholder: 'ምሳሌ Q-101 ወይም Q-326',
      trackBtn: 'ተራዬን እይ',

      teamTitle: 'የህክምና አመራሮች እና ስፔሻሊስቶች',
      teamDesc: 'ከፍተኛ ሙያዊ ብቃት ያላቸው የሆስፒታላችን ሀኪሞች እና መምህራን',
      team: [
        { name: 'ዶ/ር ሰላማዊት ታደሰ', role: 'ዋና ክሊኒካል ዳይሬክተር (CCD)', dept: 'የሆስፒታል ስራ አስኪያጅ እና ማህበረሰብ ጤና', img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80' },
        { name: 'ዶ/ር ሄኖክ በቀለ', role: 'ስፔሻሊስት ሀኪም (ኢንተርኒስት)', dept: 'የውስጥ ደዌ ህክምና ክፍል ኃላፊ', img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80' },
        { name: 'ዶ/ር ዮናስ ተስፋዬ', role: 'ስፔሻሊስት ቀዶ ሀኪም እና ትራውማቶሎጂስት', dept: 'የቀዶ ጥገና እና አጥንት ህክምና ክፍል', img: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80' },
        { name: 'ሲ/ር ቤተልሔም ግርማ', role: 'ዋና ነርስ እና የትሪያጅ አስተባባሪ', dept: 'የድንገተኛ እና ትሪያጅ ስራዎች', img: 'https://images.unsplash.com/photo-1594824813589-940028e3b5e4?auto=format&fit=crop&w=400&q=80' },
      ],

      ctaBannerTitle: 'የድንገተኛ ህክምና ወይም ሪፈራል ይፈልጋሉ?',
      ctaBannerDesc: 'የድንገተኛ ህክምና ክፍላችን እና የአደጋ ተቀባይ ቡድናችን ለድንገተኛ ቀዶ ጥገና እና ህክምና በሳምንቱ 7 ቀናት 24 ሰዓት ክፍት ነው።',
      ctaCallNow: 'ለድንገተኛ አደጋ ይደውሉ',
      ctaTVDisplay: 'የጥበቃ ክፍል የቲቪ ስክሪን ክፈት',
      emergencyHours: 'የ24 ሰዓት ድንገተኛ እና ፅኑ ህክምና • ተመላላሽ፡ ከሰኞ-ቅዳሜ ከጠዋቱ 2:00 - 12:00',
    },
    om: {
      hospitalName: 'Hospitaala Yuunivarsiitii Haramayaa',
      hospitalSub: 'Hospitaala Riifarala Ispeeshaalaayizdii Hiwoot Faanaa',
      tagline: 'Koolleejjii Saayinsii Fayyaa fi Yaalaa • Harar, Itoophiyaa',
      preTitle: 'Hospitaala Barsiisaa fi Riifarala Olaanaa Baha Itoophiyaa',
      heroTitle: 'Tajaajila Yaalaa Qulqullina Qabu,',
      heroAccent: 'Leenjii Fayyaa fi Qorannoo.',
      heroDesc:
        'Ummata naannoo Hararii, Baha Oromiyaa, Dirree Dawaa fi Naannoo Sumaalee (miliyoona 5.8 ol) kan tajaajilu. Yaala balaa tasaa sa’aatii 24, giddugala yaala kaansarii, ICU daa’immanii fi sirna dijitaalaa ammayyaa.',
      ctaStaff: session ? 'Gara Waajjiraatti Seeni' : 'Seensa Hojjettootaa',
      ctaTV: 'Agarsiisa TV Kutaa Eeggannaa',
      socialProof: 'Guyyaatti dhukkubsattoota 1,200 ol sadarkaa quubsaa 4.9/5n tajaajilla',
      phoneHotline: '(025) 666-0368',
      mobileEmergency: '+251 915 046 933',
      labPhone: '+251 25 666 7439',
      address: 'Daandii Caffee, Aanaa Jiineellaa, Harar, Itoophiyaa (S.P. 235)',

      aboutBadge: 'Maaliif Hospitaala Hiwoot Faanaa?',
      aboutTitle: 'Tajaajila jaalala fi kabaja dhukkubsattootaaf kennamu',
      aboutDesc:
        'Hospitaalli Ispeeshaalaayizdii Hiwoot Faanaa Yuunivarsiitii Haramayaa jala jiru beekumsa ammayyaa tajaajila hawaasummaa waliin madaalchisee kenna. Waggoota 60 oliif hayyoota yaalaa qulqullina qabaniin sa’aatii 24 ummata tajaajilaa jira.',

      features: [
        { title: 'Tajaajila Balaa Tasaa Sa’aatii 24', desc: 'Kutaa yaala cimaa (ICU), daa’imman fi tajaajila ambulaansii guutuu.' },
        { title: 'Gamoo Ciisichaa Ammayyaa', desc: 'Siren siree 960 ol qabu ijaaramaa kan jiru.' },
        { title: 'Laaboraatorii fi Paatoolojii Olaanaa', desc: 'Qorannoo dhiigaa, keemikaalaa fi maayikiroobaayoolojii maashinaan.' },
        { title: 'Giddugala Kaansarii Biyyooleessaa', desc: 'Itoophiyaa keessaa giddugala yaala kaansarii shanan keessaa tokko.' },
      ],

      servicesTitle: 'Kutaalee Yaalaa Ispeeshaalaayizdii',
      servicesSubtitle: 'Baha Itoophiyaa guutuuf tajaajila riifarala fi ciisichaa',

      services: [
        {
          title: 'Balaa Tasaa fi Yaala Cimaa (ICU)',
          desc: 'Tajaajila balaa tasaa sa’aatii 24, ICU ga’eessotaa fi daa’immanii ogeeyyii olaanaadhaan',
          badges: ['Sa’aatii 24 Balaa', 'Kutaa ICU', 'Ambulaansii'],
          icon: <Ambulance className="w-6 h-6 text-rose-500" />,
          img: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
        },
        {
          title: 'Yaala Keessaa fi Kaansarii',
          desc: 'Giddugala yaala onnee, kalee, sukkaaraa fi kaansarii Baha Itoophiyaa',
          badges: ['Giddugala Kaansarii', 'Yaala Onnee', 'Dhukkuba Sukkaaraa'],
          icon: <Stethoscope className="w-6 h-6 text-brand-500" />,
          img: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
        },
        {
          title: 'Fayyaa Daa’immanii fi NICU',
          desc: 'Kutaa yaala cimaa daa’imman reefu dhalatanii (NICU), talaallii fi hanqina soorataa',
          badges: ['Kutaa NICU', 'Talaallii', 'Fayyaa Daa’immanii'],
          icon: <HeartPulse className="w-6 h-6 text-emerald-500" />,
          img: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
        },
        {
          title: 'Kutaa Gadameessaa fi Dahumsaa',
          desc: 'Kunuunsa haadholii ulfaa, kutaa dahumsaa qulqulluu fi sireewwan 63 ol',
          badges: ['Kutaa Dahumsaa', 'Kunuunsa Haadholii', 'Gadameessa'],
          icon: <ShieldCheck className="w-6 h-6 text-purple-500" />,
          img: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=800&q=80',
        },
        {
          title: 'Baqaqsanii Yaaluu fi Lafee (Orthopedics)',
          desc: 'Kutaalee baqaqsanii yaaluu ammayyaa, caba lafee fi balaawwan tasaa',
          badges: ['Baqaqsanii Yaaluu', 'Yaala Lafee', 'Tiraawumaa'],
          icon: <Activity className="w-6 h-6 text-sky-500" />,
          img: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80',
        },
        {
          title: 'Laaboraatorii fi Suuraa Yaalaa (CT, X-Ray)',
          desc: 'Qorannoo maashinaatiin raawwatamu, kuusaa dhiigaa, CT Iskaan fi Iksireeyii dijitaalaa',
          badges: ['Laaboraatorii Ammayyaa', 'Kuusaa Dhiigaa', 'CT Iskaanii'],
          icon: <FlaskConical className="w-6 h-6 text-amber-500" />,
          img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
        },
      ],

      stats: [
        { num: '60+', label: 'Seenaa fi Dhaala Yuunivarsiitii' },
        { num: '5.8M+', label: 'Ummata Tajaajilamu' },
        { num: '960+', label: 'Sireewwan Ijaaramaa Jiran' },
        { num: '1,200+', label: 'Dhukkubsattoota Guyyaa' },
      ],

      checkQueueTitle: 'Sadarkaa Dabaree Keessanii Hordofaa',
      checkQueueDesc: 'Lakkoofsa tikkeetii simannaarraa isiniif kenname (fkn: Q-101) galchuun dabaree keessan ilaalaa.',
      ticketPlaceholder: 'fkn. Q-101 ykn Q-326',
      trackBtn: 'Dabaree Ilaali',

      teamTitle: 'Hoggantoota Yaalaa fi Ispeeshaalistoota',
      teamDesc: 'Ogeeyyii yaalaa muuxannoo olaanaa qabanii fi barsiisota yuunivarsiitii',
      team: [
        { name: 'Dr. Selamawit Tadesse', role: 'Daayirektara Kiliinikaa Olaanaa (CCD)', dept: 'Bulchiinsa Hospitaalaa fi Fayyaa Hawaasaa', img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80' },
        { name: 'Dr. Henok Bekele', role: 'Ispeeshaalistii Yaala Keessaa', dept: 'Kutaa Yaala Keessaa', img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80' },
        { name: 'Dr. Yonas Tesfaye', role: 'Ispeeshaalistii Baqaqsanii Yaaluu fi Lafee', dept: 'Kutaa Baqaqsanii Yaaluu fi Tiraawumaa', img: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80' },
        { name: 'Sr. Bethelhem Girma', role: 'Hoggantuu Narsitootaa fi Tiriyaajii', dept: 'Hojii Tiriyaajii fi Balaa Tasaa', img: 'https://images.unsplash.com/photo-1594824813589-940028e3b5e4?auto=format&fit=crop&w=400&q=80' },
      ],

      ctaBannerTitle: 'Yaala Balaa Tasaa ykn Riifarala Barbaadduu?',
      ctaBannerDesc: 'Gareen yaala balaa tasaa keenya sa’aatii 24, torbanitti guyyoota 7 guutuu yaalaaf banaadha.',
      ctaCallNow: 'Balaa Tasaaf Bilbilaa',
      ctaTVDisplay: 'Agarsiisa TV Kutaa Eeggannaa',
      emergencyHours: 'Sa’aatii 24 Balaa Tasaa & ICU • Dhukkubsattoota Deddeebi’an: Wiixata-Sanbata 2:00-12:00',
    },
  }[language];

  const handleTrackTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSearch.trim()) return;
    setSearchStatus('searching');

    try {
      const tickets = await getQueueTickets();
      const match = tickets.find(
        (t) => t.ticketNumber.toLowerCase().trim() === ticketSearch.toLowerCase().trim()
      );

      if (match) {
        setSearchedTicket(match);
        setSearchStatus('found');
      } else {
        setSearchedTicket(null);
        setSearchStatus('not_found');
      }
    } catch {
      setSearchStatus('not_found');
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      {/* Top University & Hospital Authority Bar */}
      <div className="bg-brand-950 text-slate-300 text-[11px] py-2 px-4 sm:px-8 border-b border-brand-900/60">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1 font-semibold text-brand-300">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Haramaya University • College of Health & Medical Sciences</span>
            </span>
            <span className="hidden md:inline text-slate-500">•</span>
            <span className="hidden md:inline text-slate-400">Harar, Ethiopia</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>24/7 Tertiary Trauma & Emergency Open</span>
            </span>
            <a href={`tel:${content.mobileEmergency.replace(/\s+/g, '')}`} className="hover:text-white font-mono font-bold text-white transition-colors">
              Hotline: {content.phoneHotline}
            </a>
          </div>
        </div>
      </div>

      {/* Main Paedia-Style Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Hospital Logo & Brand Title */}
          <div className="flex items-center space-x-3.5 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-brand-600/30">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-lg tracking-tight text-slate-950">{content.hospitalName}</span>
              </div>
              <p className="text-[11px] font-semibold text-brand-700 uppercase tracking-wider">{content.hospitalSub}</p>
            </div>
          </div>

          {/* Right Navigation & CTAs */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Direct Emergency Contact Button (Paedia contact-button style) */}
            <a
              href={`tel:${content.phoneHotline.replace(/[^\d+]/g, '')}`}
              className="hidden lg:flex items-center space-x-2 px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-bold transition-all border border-slate-200"
            >
              <PhoneCall className="w-3.5 h-3.5 text-brand-600" />
              <span>{content.phoneHotline}</span>
            </a>

            {/* Tri-Lingual Language Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <Globe className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
              {(['en', 'am', 'om'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-xl transition-all ${
                    language === l ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {l === 'en' ? 'EN' : l === 'am' ? 'አማ' : 'OM'}
                </button>
              ))}
            </div>

            {/* Waiting Room TV Display Button */}
            <button
              onClick={() => onNavigate('queue')}
              className="hidden sm:flex items-center space-x-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all shadow-sm"
              title="Launch Waiting Room TV Display"
            >
              <Tv className="w-4 h-4 text-sky-600" />
              <span>TV Display</span>
            </button>

            {/* Staff Portal CTA */}
            <button
              onClick={() => onNavigate(session ? 'app' : 'login')}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold bg-brand-600 hover:bg-brand-700 text-white transition-all shadow-md shadow-brand-600/25"
            >
              <LogIn className="w-4 h-4" />
              <span>{content.ctaStaff}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section (Paedia Warm Hero Design with Overlay and Avatar Badge) */}
      <section className="relative overflow-hidden pt-8 pb-20 lg:pt-14 lg:pb-28 bg-gradient-to-b from-slate-900 via-brand-950 to-slate-900 text-white">
        {/* Background Image with Dark Vignette */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=2000&q=80"
            alt="Hospital Exterior"
            className="w-full h-full object-cover opacity-20 filter contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-brand-950/85"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-400/30 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>{content.preTitle}</span>
            </div>

            {/* Hero Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-white">
              {content.heroTitle}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-brand-300 to-emerald-300">
                {content.heroAccent}
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
              {content.heroDesc}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-4">
              <button
                onClick={() => onNavigate(session ? 'app' : 'login')}
                className="px-8 py-4 rounded-2xl bg-brand-500 hover:bg-brand-400 text-white font-extrabold text-sm flex items-center justify-center space-x-3 shadow-xl shadow-brand-500/30 transition-all group"
              >
                <span>{content.ctaStaff}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onNavigate('queue')}
                className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold text-sm flex items-center justify-center space-x-3 backdrop-blur-md transition-all"
              >
                <Tv className="w-4 h-4 text-sky-400" />
                <span>{content.ctaTV}</span>
              </button>
            </div>

            {/* Paedia-Style Avatar Rating Bar */}
            <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center -space-x-2">
                <img className="w-10 h-10 rounded-full border-2 border-slate-900 object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" alt="Patient" />
                <img className="w-10 h-10 rounded-full border-2 border-slate-900 object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80" alt="Patient" />
                <img className="w-10 h-10 rounded-full border-2 border-slate-900 object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80" alt="Patient" />
                <div className="w-10 h-10 rounded-full bg-brand-500 border-2 border-slate-900 flex items-center justify-center text-xs font-black text-white">
                  ★
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-1 text-amber-400 text-sm">
                  {'★★★★★'}
                </div>
                <p className="text-xs font-medium text-slate-300 mt-0.5">{content.socialProof}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Paedia-Style Horizontal Stats Divider Section */}
      <section className="bg-brand-900 text-white py-8 border-y border-brand-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x-0 md:divide-x divide-brand-800">
            {content.stats.map((st) => (
              <div key={st.label} className="px-4 py-2">
                <div className="text-3xl sm:text-4xl font-black tracking-tight text-brand-300">{st.num}</div>
                <div className="text-xs font-semibold text-slate-300 mt-1">{st.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Paedia-Style About Section ("Care that puts patients first") */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Hospital Imagery */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=900&q=80"
                  alt="Hiwot Fana Teaching Hospital"
                  className="w-full h-[450px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-brand-600 text-white">
                    Established Campus
                  </span>
                  <h4 className="text-lg font-bold mt-2">Hiwot Fana Specialized University Hospital</h4>
                  <p className="text-xs text-slate-300 mt-1">Caffe Street, Jinela Woreda, Harar, Ethiopia</p>
                </div>
              </div>
            </div>

            {/* Right: Narrative & 4 Features Grid */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-100 text-brand-800 text-xs font-bold border border-brand-200">
                <Award className="w-3.5 h-3.5 text-brand-600" />
                <span>{content.aboutBadge}</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {content.aboutTitle}
              </h2>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {content.aboutDesc}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {content.features.map((feat) => (
                  <div key={feat.title} className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1">
                    <div className="flex items-center space-x-2 text-brand-700 font-bold text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{feat.title}</span>
                    </div>
                    <p className="text-xs text-slate-500 pl-6 leading-relaxed">{feat.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Patient Queue Tracker (Waiting Room Widget) */}
      <section className="py-14 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden border border-slate-800">
            <div className="relative z-10 space-y-4">
              <div className="flex items-center space-x-2 text-brand-400">
                <Clock className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Hospital Live Queue Tracker</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white">{content.checkQueueTitle}</h2>
              <p className="text-slate-300 text-sm">{content.checkQueueDesc}</p>

              <form onSubmit={handleTrackTicket} className="pt-2 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={ticketSearch}
                    onChange={(e) => setTicketSearch(e.target.value)}
                    placeholder={content.ticketPlaceholder}
                    className="w-full pl-11 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                </div>
                <button
                  type="submit"
                  className="px-7 py-3.5 bg-brand-500 hover:bg-brand-400 text-white font-extrabold rounded-2xl text-sm transition-all flex items-center justify-center space-x-2 shadow-lg shadow-brand-500/30"
                >
                  <span>{content.trackBtn}</span>
                </button>
              </form>

              {/* Status Result Display */}
              {searchStatus === 'found' && searchedTicket && (
                <div className="mt-4 p-5 rounded-2xl bg-white/10 border border-white/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl font-black text-white">{searchedTicket.ticketNumber}</span>
                      <span className={`text-xs px-3 py-1 rounded-full font-extrabold ${
                        searchedTicket.status === 'in_consultation' ? 'bg-emerald-400 text-slate-950 animate-pulse' :
                        searchedTicket.status === 'completed' ? 'bg-slate-300 text-slate-900' :
                        searchedTicket.status === 'pending_lab' ? 'bg-amber-400 text-slate-950' :
                        'bg-sky-400 text-slate-950'
                      }`}>
                        {searchedTicket.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      Patient: <strong className="text-white">{searchedTicket.patientName}</strong> • MRN: <strong className="text-white font-mono">{searchedTicket.patientMrn}</strong>
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-brand-300 font-bold uppercase tracking-wider">Department:</span>
                    <p className="text-base font-extrabold text-white">{searchedTicket.department || 'General Outpatient'}</p>
                  </div>
                </div>
              )}

              {searchStatus === 'not_found' && (
                <div className="mt-4 p-4 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-200 text-xs flex items-center space-x-2.5">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>No active queue ticket found for "{ticketSearch}". Please confirm the ticket number given at the reception desk.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Paedia-Style Specialized Services Grid with Badge Tags & Zoom Image */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-100 text-brand-800 text-xs font-bold border border-brand-200">
              <Building2 className="w-3.5 h-3.5 text-brand-600" />
              <span>Haramaya Clinical Divisions</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">{content.servicesTitle}</h2>
            <p className="text-sm text-slate-600">{content.servicesSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.services.map((srv) => (
              <div
                key={srv.title}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Image Container with Zoom effect */}
                <div className="relative h-52 overflow-hidden bg-slate-100">
                  <img
                    src={srv.img}
                    alt={srv.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 p-3 rounded-2xl bg-white/90 backdrop-blur-md shadow-md">
                    {srv.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-950 group-hover:text-brand-600 transition-colors">
                      {srv.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed mt-2">{srv.desc}</p>
                  </div>

                  {/* Paedia-style Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                    {srv.badges.map((b) => (
                      <span key={b} className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Paedia-Style Clinical Leadership & Specialists Section */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-100 text-brand-800 text-xs font-bold border border-brand-200">
              <Users className="w-3.5 h-3.5 text-brand-600" />
              <span>Medical Faculty & Care Team</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">{content.teamTitle}</h2>
            <p className="text-sm text-slate-600">{content.teamDesc}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.team.map((m) => (
              <div key={m.name} className="bg-slate-50 rounded-3xl p-5 border border-slate-200 text-center flex flex-col items-center">
                <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-4 border-white shadow-md">
                  <img src={m.img} alt={m.name} className="w-full h-full object-cover" />
                </div>
                <h4 className="text-sm font-black text-slate-900">{m.name}</h4>
                <p className="text-xs font-bold text-brand-700 mt-0.5">{m.role}</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-normal">{m.dept}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Paedia-Style CTA Emergency Banner */}
      <section className="py-16 bg-slate-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 rounded-3xl p-8 sm:p-12 border border-brand-700/50 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center space-x-2 text-brand-300 text-xs font-bold uppercase tracking-wider">
                <Ambulance className="w-4 h-4" />
                <span>Immediate Tertiary Medical Assistance</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">{content.ctaBannerTitle}</h2>
              <p className="text-sm text-slate-200 leading-relaxed">{content.ctaBannerDesc}</p>
              <div className="pt-2 text-xs text-brand-200 font-semibold">{content.emergencyHours}</div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full lg:w-auto">
              <a
                href={`tel:${content.phoneHotline.replace(/[^\d+]/g, '')}`}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-brand-900 font-black text-sm flex items-center justify-center space-x-2 shadow-lg transition-all"
              >
                <PhoneCall className="w-4 h-4 text-brand-700" />
                <span>{content.ctaCallNow} ({content.phoneHotline})</span>
              </a>

              <button
                onClick={() => onNavigate('queue')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-sm flex items-center justify-center space-x-2 border border-brand-400/30 transition-all"
              >
                <Tv className="w-4 h-4" />
                <span>{content.ctaTVDisplay}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Hospital Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center space-x-3 text-white font-black text-base">
                <Building2 className="w-6 h-6 text-brand-400" />
                <span>{content.hospitalName}</span>
              </div>
              <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                Hiwot Fana Comprehensive Specialized University Hospital serves as the principal teaching and tertiary referral hospital for the College of Health and Medical Sciences of Haramaya University in Harar, Ethiopia.
              </p>
              <div className="pt-2 text-slate-300 space-y-1">
                <p className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-brand-400" />
                  <span>{content.address}</span>
                </p>
                <p className="flex items-center space-x-2">
                  <PhoneCall className="w-3.5 h-3.5 text-brand-400" />
                  <span>CCD Office: {content.phoneHotline} • Lab: {content.labPhone}</span>
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Clinical Divisions</h4>
              <ul className="space-y-2 text-slate-400">
                <li>Emergency & Trauma Center</li>
                <li>Internal Medicine & Oncology</li>
                <li>Pediatrics & Neonatal ICU</li>
                <li>Obstetrics & Gynecology</li>
                <li>Surgery & Orthopedics</li>
                <li>Diagnostic Laboratory & Imaging</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">System Access</h4>
              <div className="space-y-2 flex flex-col">
                <button onClick={() => onNavigate('home')} className="text-left hover:text-white transition-colors">Hospital Portal Home</button>
                <button onClick={() => onNavigate('queue')} className="text-left hover:text-white transition-colors">Waiting Room TV Display</button>
                <button onClick={() => onNavigate('login')} className="text-left hover:text-white transition-colors">Staff Medical Workspace</button>
                <a href="https://www.haramaya.edu.et" target="_blank" rel="noreferrer" className="flex items-center space-x-1 hover:text-white transition-colors">
                  <span>Haramaya University Web</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
            <p>© 2026 Haramaya University Hiwot Fana Comprehensive Specialized Hospital. All rights reserved.</p>
            <p>Digital Healthcare & Clinical Workflow PWA System</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
