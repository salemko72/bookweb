import { useEffect, useState } from 'react'
import { getSettings, type AppLanguage } from './settings'

const dictionaries = {
  en: {
    home: 'Home', calendar: 'Calendar', properties: 'Properties', newBooking: 'New Booking', settings: 'Settings', logout: 'Logout',
    email: 'Email', password: 'Password', bookingManagement: 'Booking Management', welcomeBack: 'Welcome back', signInToManage: 'Sign in to manage your properties.',
    dailyOverview: 'Daily Overview', goodMorning: 'Good morning, Kate', todayOverview: "Today's operational overview.", checkIns: 'Check-ins', checkOuts: 'Check-outs', cleanings: 'Cleanings',
    availability: 'Availability', continuousTimeline: 'Continuous availability timeline.', fit: 'FIT', zoom: 'Zoom', previous: 'Previous period', next: 'Next period',
    portfolio: 'Portfolio', homesDetailsAvailability: 'Homes, access details and availability.', newProperty: 'New property', editProperty: 'Edit property', propertyDetails: 'Property details',
    addPropertyImage: 'Add property image', changeImage: 'Change image', removeImage: 'Remove image', imageHint: 'JPG, PNG or WEBP · max 2 MB',
    name: 'Name', color: 'Color', address: 'Address', city: 'City', guests: 'Guests', rooms: 'Rooms', area: 'Area', cleaning: 'Cleaning', checkIn: 'Check-in', checkOut: 'Check-out',
    notes: 'Notes', createProperty: 'Create property', saveChanges: 'Save changes', deactivate: 'Deactivate', active: 'Active', inactive: 'Inactive',
    regionalMeasurement: 'Regional & measurement', language: 'Language', measurementUnits: 'Measurement units', dateFormat: 'Date format', appearance: 'Appearance',
    administration: 'Administration', people: 'People', calendarSources: 'Calendar Sources', notifications: 'Notifications', account: 'Account', propertiesHint: 'Homes, details & images', peopleHint: 'Roles & property access', calendarSourcesHint: 'Airbnb & Booking.com', notificationsHint: 'Arrival & cleaning alerts', accountHint: 'Profile & security', notificationsTitle: 'Notifications', notificationsDescription: 'Choose which operational reminders you receive.', arrivals: 'Arrivals', departures: 'Departures', cleaningReminders: 'Cleaning reminders', newReservationAlerts: 'New reservation alerts', saveNotifications: 'Save notifications', calendarSourcesTitle: 'Calendar Sources', calendarSourcesDescription: 'Store your Airbnb and Booking.com iCal links for the next sync step.', airbnbIcalUrl: 'Airbnb iCal URL', bookingIcalUrl: 'Booking.com iCal URL', saveCalendarSources: 'Save calendar sources', notSyncedYet: 'Links saved locally. Calendar sync will use these sources in the next integration pass.', accountTitle: 'Account', accountDescription: 'Signed-in account and session controls.', signedInAs: 'Signed in as', signOut: 'Sign out',
    chooseLooks: 'Choose how the app looks.', formattingIndependent: 'Formatting stays independent from interface language.',
    light: 'Light', dark: 'Dark', system: 'System', english: 'English', croatian: 'Hrvatski', metric: 'Metric (m², °C)', imperial: 'Imperial (ft², °F)',
    stay: 'Stay', guest: 'Guest', source: 'Source', directManual: 'Direct / Manual', agency: 'Agency', createBooking: 'Create booking', creatingBooking: 'Creating booking…',
    addressSearch: 'Start typing an address', addressFallback: 'You can also enter the address manually.', addressSearchError: 'Address search is temporarily unavailable. You can still enter the address manually.',
    searchMap: 'Search address', mapPreview: 'Map preview', selectLocation: 'Select a location',
    logoutTitle: 'Sign out',
  },
  hr: {
    home: 'Početna', calendar: 'Kalendar', properties: 'Nekretnine', newBooking: 'Nova rezervacija', settings: 'Postavke', logout: 'Odjava',
    email: 'E-mail', password: 'Lozinka', bookingManagement: 'Booking Management', welcomeBack: 'Dobro došli nazad', signInToManage: 'Prijavite se za upravljanje nekretninama.',
    dailyOverview: 'Dnevni pregled', goodMorning: 'Dobro jutro, Kate', todayOverview: 'Današnji operativni pregled.', checkIns: 'Dolazci', checkOuts: 'Odlasci', cleanings: 'Čišćenja',
    availability: 'Dostupnost', continuousTimeline: 'Kontinuirana vremenska linija rezervacija.', fit: 'UKLOPI', zoom: 'Zum', previous: 'Prethodni period', next: 'Sljedeći period',
    portfolio: 'Portfolio', homesDetailsAvailability: 'Nekretnine, detalji i dostupnost.', newProperty: 'Nova nekretnina', editProperty: 'Uredi nekretninu', propertyDetails: 'Detalji nekretnine',
    addPropertyImage: 'Dodaj sliku nekretnine', changeImage: 'Promijeni sliku', removeImage: 'Ukloni sliku', imageHint: 'JPG, PNG ili WEBP · max 2 MB',
    name: 'Naziv', color: 'Boja', address: 'Adresa', city: 'Grad', guests: 'Gostiju', rooms: 'Sobe', area: 'Površina', cleaning: 'Čišćenje', checkIn: 'Dolazak', checkOut: 'Odlazak',
    notes: 'Napomena', createProperty: 'Kreiraj nekretninu', saveChanges: 'Sačuvaj izmjene', deactivate: 'Deaktiviraj', active: 'Aktivna', inactive: 'Neaktivna',
    regionalMeasurement: 'Regionalno i mjere', language: 'Jezik', measurementUnits: 'Mjerne jedinice', dateFormat: 'Format datuma', appearance: 'Izgled',
    administration: 'Administracija', people: 'Ljudi', calendarSources: 'Izvori kalendara', notifications: 'Obavijesti', account: 'Račun', propertiesHint: 'Nekretnine, detalji i slike', peopleHint: 'Uloge i pristup nekretninama', calendarSourcesHint: 'Airbnb i Booking.com', notificationsHint: 'Dolazak i čišćenja', accountHint: 'Profil i sigurnost', notificationsTitle: 'Obavijesti', notificationsDescription: 'Odaberite operativne podsjetnike koje želite primati.', arrivals: 'Dolazci', departures: 'Odlasci', cleaningReminders: 'Podsjetnici za čišćenje', newReservationAlerts: 'Obavijesti o novim rezervacijama', saveNotifications: 'Sačuvaj obavijesti', calendarSourcesTitle: 'Izvori kalendara', calendarSourcesDescription: 'Sačuvajte Airbnb i Booking.com iCal linkove za sljedeći korak sinhronizacije.', airbnbIcalUrl: 'Airbnb iCal URL', bookingIcalUrl: 'Booking.com iCal URL', saveCalendarSources: 'Sačuvaj izvore kalendara', notSyncedYet: 'Linkovi su sačuvani lokalno. Sinhronizacija kalendara dolazi u sljedećem koraku.', accountTitle: 'Račun', accountDescription: 'Prijavljeni račun i kontrola sesije.', signedInAs: 'Prijavljeni korisnik', signOut: 'Odjavi se',
    chooseLooks: 'Odaberite izgled aplikacije.', formattingIndependent: 'Formatiranje je nezavisno od jezika sučelja.',
    light: 'Svijetlo', dark: 'Tamno', system: 'Sistem', english: 'English', croatian: 'Hrvatski', metric: 'Metrički (m², °C)', imperial: 'Imperijalni (ft², °F)',
    stay: 'Boravak', guest: 'Gost', source: 'Izvor', directManual: 'Direktno / Ručno', agency: 'Agencija', createBooking: 'Kreiraj rezervaciju', creatingBooking: 'Kreiranje rezervacije…',
    addressSearch: 'Počnite unositi adresu', addressFallback: 'Adresu možete unijeti i ručno.', addressSearchError: 'Pretraga adrese trenutno nije dostupna. Adresu možete unijeti ručno.',
    searchMap: 'Pretraži adresu', mapPreview: 'Pregled karte', selectLocation: 'Odaberite lokaciju',
    logoutTitle: 'Odjavi se',
  },
} satisfies Record<AppLanguage, Record<string, string>>

type TranslationKey = keyof typeof dictionaries.en

export function translate(language: AppLanguage, key: TranslationKey): string {
  return dictionaries[language][key]
}

export function useAppLanguage(): AppLanguage {
  const [language, setLanguage] = useState<AppLanguage>(() => getSettings().language)
  useEffect(() => {
    const handle = () => setLanguage(getSettings().language)
    window.addEventListener('booking-manager-settings-change', handle)
    return () => window.removeEventListener('booking-manager-settings-change', handle)
  }, [])
  return language
}

export function useT() {
  const language = useAppLanguage()
  return (key: TranslationKey) => translate(language, key)
}
