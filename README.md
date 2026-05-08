# Noor Al Imaan Registration System

## 🌙 About
A comprehensive bilingual registration system for Noor Al Imaan community, supporting Afan Oromo, Amharic, English, and Arabic languages.

## 🚀 Features
- **Bilingual Forms**: Dual input fields for Afan Oromo/Amharic and English
- **Participation Tracking**: Multiple support options (ideas, financial, materials, provisions)
- **Modern Design**: Responsive layout with professional styling
- **Database Integration**: Complete Supabase backend integration
- **Phone Support**: Contact information collection
- **Logo Integration**: Custom branding with circular logo display
- **Feedback System**: User feedback collection and management

## 📁 Project Structure
```
noor-al-imaan/
├── standalone.html              # Main registration form
├── database-schema-final.sql   # Database schema (production-ready)
├── database-schema-fixed.sql   # Database schema (fixed version)
├── database-schema.sql         # Original database schema
├── supabase_setup.sql         # Supabase-specific setup
├── SUPABASE_SETUP.md         # Setup documentation
├── server.js                  # Node.js development server
├── package.json               # Node.js dependencies
├── .gitignore               # Git ignore rules
├── .env                     # Environment variables (private)
├── GITHUB_SETUP.md          # GitHub upload instructions
├── README.md                # This file
└── public/                   # Static assets
    └── noor al imaan.png   # Logo image
```

## 🛠️ Technologies Used
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Supabase (PostgreSQL)
- **Styling**: Modern CSS with Flexbox/Grid
- **Icons**: Font Awesome 6
- **Fonts**: Google Fonts (Inter, Noto Sans Arabic)
- **Server**: Node.js (development)

## 🗄️ Database Schema
The system uses two main tables:

### `user_registrations`
- Bilingual personal information (Afaan Oromo/Amharic + English)
- Participation options tracking (5 types)
- Phone number support for both languages
- Automatic timestamps and validation
- Data integrity constraints

### `user_feedbacks`
- User feedback collection with ratings
- Status tracking workflow (pending → resolved)
- Admin response capabilities
- Link to registrations or anonymous submissions

## 🚀 Quick Start

### For Development:
1. **Install dependencies**: `npm install` (if Node.js available)
2. **Start server**: `node server.js`
3. **Open browser**: Navigate to `http://localhost:3000`

### For Production:
1. **Setup Database**: Execute `database-schema-final.sql` in Supabase dashboard
2. **Configure Environment**: Update `.env` with your Supabase credentials
3. **Deploy**: Upload `standalone.html` to your web server

## 🔧 Configuration

### Supabase Setup
- **URL**: `https://khghiyvahojawixjmlsv.supabase.co`
- **Anon Key**: Stored in `.env` file
- **Tables**: Created via `database-schema-final.sql`

### Environment Variables
```env
SUPABASE_URL=https://khghiyvahojawixjmlsv.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
```

## 📱 Supported Languages
- **Afaan Oromo**: Primary local language
- **Amharic**: Secondary local language  
- **English**: International language
- **Arabic**: Religious context (header display)

## 🎨 Design Features
- **Responsive Layout**: Mobile-friendly design
- **Modern UI**: Clean, professional interface
- **Accessibility**: Semantic HTML structure
- **Cultural Elements**: Arabic script integration
- **Interactive Forms**: Real-time validation and feedback
- **Logo Display**: Circular branding with fallback

## 📊 Data Collection
The form collects:
- Personal information (bilingual)
- Contact details (phone numbers)
- Participation preferences (multiple options)
- Feedback and ratings (1-5 stars)
- Geographic data (cities, districts, mosques)

## 🔒 Security Features
- **Row Level Security**: Supabase RLS policies
- **Input Validation**: Client and server-side validation
- **XSS Protection**: HTML escaping for user inputs
- **Data Privacy**: Secure credential handling

## 🌐 Deployment Options

Since Git/GitHub CLI are not available, here are recommended approaches:

### Option 1: Manual Upload via GitHub Web Interface
1. Go to https://github.com/mahifeysal69-lang/noor-al-imaan
2. Click "Add file" button
3. Upload files manually:
   - `standalone.html` (main registration form)
   - `database-schema-final.sql` (database schema)
   - `README.md` (documentation)
   - `.gitignore` (Git ignore rules)
   - `server.js` (Node.js server)
   - `package.json` (dependencies)

### Option 2: Create ZIP Archive
1. Create ZIP file containing all project files
2. Upload to GitHub releases
3. Users can download and extract the complete project

### Option 3: Use External Tools
1. Download GitHub Desktop from https://desktop.github.com
2. Clone repository locally
3. Copy files to cloned repository
4. Commit and push via desktop application

## 📧 Development Notes
- The `.env` file contains sensitive credentials - **DO NOT upload to public repositories**
- Use the development server (`server.js`) for local testing
- The registration form automatically saves data to Supabase when submitted
- All form fields are optional except for basic validation requirements
- Logo image path: `./public/noor%20al%20imaan.png` (URL encoded)

## 🔄 Database Setup Instructions

### Step 1: Execute Schema
1. Go to your Supabase dashboard
2. Open SQL Editor
3. Copy and execute contents of `database-schema-final.sql`
4. Verify tables are created successfully

### Step 2: Verify Policies
1. Check Row Level Security is enabled
2. Verify policies are created correctly
3. Test public insert permissions

### Step 3: Test Data Flow
1. Fill out registration form
2. Submit to test data insertion
3. Check data appears in `user_registrations` table

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License
This project is open source and available under the MIT License.

## 📞 Support
For questions or support, please create an issue in the GitHub repository or contact the development team.

---

**Noor Al Imaan Registration System**  
*Building Community Through Technology*
