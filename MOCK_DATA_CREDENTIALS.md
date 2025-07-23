# Mock Data User Credentials

This document contains all the test user credentials for the PetWhenua application mock data.

## 🔐 **Universal Password**
All mock data users use the same password: **`TestPass123!`**

---

## 🎯 **Site Administrator**

| Role | Email | Username | Password | Name | Location |
|------|-------|----------|----------|------|----------|
| Site Admin | `siteadmin@petwhenua.co.nz` | `siteadmin` | `TestPass123!` | Alex Smith | Auckland, Auckland City |

---

## 🎪 **Meetup Administrators**

| Role | Email | Username | Password | Name | Location |
|------|-------|----------|----------|------|----------|
| Meetup Admin | `meetupadmin01@petwhenua.co.nz` | `meetupadmin01` | `TestPass123!` | Sarah Johnson | Auckland, Auckland City |
| Meetup Admin | `meetupadmin02@petwhenua.co.nz` | `meetupadmin02` | `TestPass123!` | Mike Wilson | Wellington, Wellington City |
| Meetup Admin | `meetupadmin03@petwhenua.co.nz` | `meetupadmin03` | `TestPass123!` | Emma Brown | Canterbury, Christchurch City |
| Meetup Admin | `meetupadmin04@petwhenua.co.nz` | `meetupadmin04` | `TestPass123!` | David Lee | Bay of Plenty, Tauranga |
| Meetup Admin | `meetupadmin05@petwhenua.co.nz` | `meetupadmin05` | `TestPass123!` | Lisa Taylor | Otago, Dunedin |

---

## 🩺 **Veterinarians**

| Role | Email | Username | Password | Name | Location |
|------|-------|----------|----------|------|----------|
| Vet | `vet01@petwhenua.co.nz` | `vet01` | `TestPass123!` | Dr. James Anderson | Auckland, Auckland City |
| Vet | `vet02@petwhenua.co.nz` | `vet02` | `TestPass123!` | Dr. Maria Garcia | Wellington, Wellington City |
| Vet | `vet03@petwhenua.co.nz` | `vet03` | `TestPass123!` | Dr. Robert Chen | Canterbury, Christchurch City |
| Vet | `vet04@petwhenua.co.nz` | `vet04` | `TestPass123!` | Dr. Sophie Williams | Waikato, Hamilton |
| Vet | `vet05@petwhenua.co.nz` | `vet05` | `TestPass123!` | Dr. Tom Miller | Bay of Plenty, Tauranga |

---

## 👥 **Community Members**

| Role | Email | Username | Password | Name | Location |
|------|-------|----------|----------|------|----------|
| Member | `member01@petwhenua.co.nz` | `member01` | `TestPass123!` | Emily Davis | Auckland, Auckland City |
| Member | `member02@petwhenua.co.nz` | `member02` | `TestPass123!` | Chris Thompson | Auckland, Auckland City |
| Member | `member03@petwhenua.co.nz` | `member03` | `TestPass123!` | Jessica White | Wellington, Wellington City |
| Member | `member04@petwhenua.co.nz` | `member04` | `TestPass123!` | Daniel Clark | Wellington, Wellington City |
| Member | `member05@petwhenua.co.nz` | `member05` | `TestPass123!` | Amanda Lewis | Canterbury, Christchurch City |
| Member | `member06@petwhenua.co.nz` | `member06` | `TestPass123!` | Ryan Hall | Canterbury, Christchurch City |
| Member | `member07@petwhenua.co.nz` | `member07` | `TestPass123!` | Nicole Young | Waikato, Hamilton |
| Member | `member08@petwhenua.co.nz` | `member08` | `TestPass123!` | Jason King | Waikato, Hamilton |
| Member | `member09@petwhenua.co.nz` | `member09` | `TestPass123!` | Rachel Wright | Bay of Plenty, Tauranga |
| Member | `member10@petwhenua.co.nz` | `member10` | `TestPass123!` | Mark Green | Bay of Plenty, Tauranga |

---

## 🌍 **Application URLs**

- **Azure Frontend**: https://orange-plant-0ccfa0d00.1.azurestaticapps.net
- **Azure Backend**: https://petwhenua-gpggdjawh0duc2du.australiaeast-01.azurewebsites.net

---

## 📋 **Quick Test Scenarios**

### **Admin Functions**
- **Login as Site Admin**: Use `siteadmin@petwhenua.co.nz`
- **Test admin panel access and user management**

### **Meetup Management**
- **Login as Meetup Admin**: Use `meetupadmin01@petwhenua.co.nz` (Auckland)
- **Create and manage pet meetup events**

### **Veterinary Services**
- **Login as Vet**: Use `vet01@petwhenua.co.nz` (Auckland)
- **Post veterinary services and advice**

### **Community Interaction**
- **Login as Member**: Use `member01@petwhenua.co.nz` (Auckland)
- **Create posts, connect pets, join meetups**

### **Location-Based Testing**
Test users are distributed across 6 New Zealand locations:
- **Auckland**: siteadmin, meetupadmin01, vet01, member01, member02
- **Wellington**: meetupadmin02, vet02, member03, member04
- **Canterbury/Christchurch**: meetupadmin03, vet03, member05, member06
- **Waikato/Hamilton**: vet04, member07, member08
- **Bay of Plenty/Tauranga**: meetupadmin04, vet05, member09, member10
- **Otago/Dunedin**: meetupadmin05

---

## 🐾 **Mock Data Features**

Each user account includes:
- **Profile Information**: Name, bio, location, profile picture
- **Pets**: 1-3 pets per user with diverse breeds and details
- **Posts**: Various types (moments, services, meetups, buy/sell)
- **Relationships**: User follows and pet connections based on location
- **Comments**: Interactions on posts and content
- **Timezone**: All data uses New Zealand/Auckland timezone

---

## ⚠️ **Security Note**

These credentials are for **testing purposes only** in development and staging environments. 
**Never use these credentials in production environments.** 