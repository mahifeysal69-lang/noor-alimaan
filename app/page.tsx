import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Head from 'next/head'

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://khghiyvahojawixjmlsv.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZ2hpeXZhaG9qYXdpeGptbHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxODAwMjIsImV4cCI6MjA5Mzc1NjAyMn0.0Kmq-WhSWSGx_IjX3wjWW5rhfxYBx87d-zANNNJWzbA'
)

interface FormData {
  // Afan Oromo/Amharic data
  fullName: string
  age: string
  city: string
  gender: string
  village: string
  mosque: string
  phone: string
  
  // English/Amharic data
  fullNameEn: string
  ageEn: string
  cityEn: string
  genderEn: string
  villageEn: string
  mosqueEn: string
  phoneEn: string
  
  // Participation options
  participation: string[]
}

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    // Afan Oromo/Amharic data
    fullName: '',
    age: '',
    city: '',
    gender: 'Dhiirraa (Dhiiraa) / ወንድ',
    village: '',
    mosque: '',
    phone: '',
    
    // English/Amharic data
    fullNameEn: '',
    ageEn: '',
    cityEn: '',
    genderEn: 'Male / ወንድ',
    villageEn: '',
    mosqueEn: '',
    phoneEn: '',
    
    // Participation options
    participation: []
  })

  const [output, setOutput] = useState<string>('📋 ውጤት / Output will appear here after clicking "Collect Information"')
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleParticipationChange = (value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      participation: checked 
        ? [...prev.participation, value]
        : prev.participation.filter(item => item !== value)
    }))
  }

  const resetForm = () => {
    setFormData({
      fullName: '',
      age: '',
      city: '',
      gender: 'Dhiirraa (Dhiiraa) / ወንድ',
      village: '',
      mosque: '',
      phone: '',
      fullNameEn: '',
      ageEn: '',
      cityEn: '',
      genderEn: 'Male / ወንድ',
      villageEn: '',
      mosqueEn: '',
      phoneEn: '',
      participation: []
    })
    setOutput('✨ ቅጹ ተጠርጓል / Form reset. Enter new data.')
  }

  const collectInformation = async () => {
    setIsLoading(true)
    
    // Build formatted output
    let formattedOutput = "═ ✦ معلومات التسجيل ✦ ═\n"
    formattedOutput += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
    formattedOutput += "🔹 LEFT SIDE (Afaan Oromo / አማርኛ):\n"
    formattedOutput += `   • Magaa Guutuu (ሙሉ ስም): ${formData.fullName || '(Not provided)'}\n`
    formattedOutput += `   • Umrii (እድሜ): ${formData.age || '—'}\n`
    formattedOutput += `   • Magaalaa (ከተማ): ${formData.city || '—'}\n`
    formattedOutput += `   • Saala (ጾታ): ${formData.gender || '—'}\n`
    formattedOutput += `   • Ganda / Wereda (ወረዳ): ${formData.village || '—'}\n`
    formattedOutput += `   • Masjiid (መስጊድ): ${formData.mosque || '—'}\n`
    formattedOutput += `   • Telefoon (ስልክ): ${formData.phone || '—'}\n`
    formattedOutput += "\n🔸 RIGHT SIDE (English / Amharic Context):\n"
    formattedOutput += `   • Full Name (ሙሉ ስም): ${formData.fullNameEn || '(Not provided)'}\n`
    formattedOutput += `   • Age (እድሜ): ${formData.ageEn || '—'}\n`
    formattedOutput += `   • City/Town (ከተማ): ${formData.cityEn || '—'}\n`
    formattedOutput += `   • Gender (ጾታ): ${formData.genderEn || '—'}\n`
    formattedOutput += `   • Village/District (ወረዳ): ${formData.villageEn || '—'}\n`
    formattedOutput += `   • Mosque (መስጊድ): ${formData.mosqueEn || '—'}\n`
    formattedOutput += `   • Phone (ስልክ): ${formData.phoneEn || '—'}\n`
    formattedOutput += "\n📌 Haala Hirmaannaa (የተሳትፎ ሁኔታ) - Participation Status:\n"
    formattedOutput += `   ✓ ${formData.participation.length ? formData.participation.join(', ') : 'ምንም አልተመረጠም / None selected'}\n`
    formattedOutput += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
    formattedOutput += `🌙 NOOR AL IMAAN | نور الإيمان  | መረጃ በትክክል ተሰብስቧል\n`

    setOutput(formattedOutput)

    // Save to Supabase
    try {
      const participationData = {
        participation_idea: false,
        participation_money: false,
        participation_material: false,
        participation_provision: false,
        participation_all: false
      }

      formData.participation.forEach(option => {
        if (option.includes('Yaadaa')) participationData.participation_idea = true
        if (option.includes('Mallaqaan')) participationData.participation_money = true
        if (option.includes('Meeshaalee')) participationData.participation_material = true
        if (option.includes('Dhiyeessii')) participationData.participation_provision = true
        if (option.includes('Hundaan')) participationData.participation_all = true
      })

      const submissionData = {
        // Afan Oromo/Amharic data
        full_name_oromo: formData.fullName.trim() || null,
        age_oromo: parseInt(formData.age) || null,
        city_oromo: formData.city.trim() || null,
        gender_oromo: formData.gender || null,
        village_oromo: formData.village.trim() || null,
        mosque_oromo: formData.mosque.trim() || null,
        phone_oromo: formData.phone.trim() || null,
        
        // English/Amharic data
        full_name_english: formData.fullNameEn.trim() || null,
        age_english: parseInt(formData.ageEn) || null,
        city_english: formData.cityEn.trim() || null,
        gender_english: formData.genderEn || null,
        village_english: formData.villageEn.trim() || null,
        mosque_english: formData.mosqueEn.trim() || null,
        phone_english: formData.phoneEn.trim() || null,
        
        // Participation options
        ...participationData
      }

      const { data, error } = await supabase
        .from('user_registrations')
        .insert([submissionData])

      if (error) {
        console.error('Supabase error:', error)
        setOutput(prev => prev + `<br><br><span style="color: red;">❌ Error saving to database: ${error.message}</span>`)
      } else {
        console.log('Data saved successfully:', data)
        setOutput(prev => prev + `<br><br><span style="color: green;">✅ Data saved successfully to database!</span>`)
      }
    } catch (error) {
      console.error('Error saving to Supabase:', error)
      setOutput(prev => prev + `<br><br><span style="color: red;">❌ Network error: Could not save to database</span>`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Noor Al Imaan | معلومات登记中心</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
      </Head>

      <div className="main-container">
        {/* HEADER with three key elements: top left NOOR, center logo, top right NOOR + Arabic */}
        <div className="header">
          <div className="header-left">
            <span className="noor-title"><i className="fas fa-star-of-life" style={{fontSize: '1rem'}}></i> NOOR AL IMAAN</span>
          </div>
          <div className="logo-circle">
            <img src="/public/noor%20al%20imaan.png" alt="Noor Al Imaan Logo" onError={(e) => e.currentTarget.style.display = 'none'} />
            <i className="fas fa-circle-notch" style={{display: 'none'}}></i>
          </div>
          <div className="header-right">
            <span className="noor-title">NOOR AL IMAAN</span>
            <span className="arabic-noor">نور الإيمان</span>
          </div>
        </div>

        {/* Information Fields (Top Half): Bilingual left vs right */}
        <div className="info-grid">
          {/* LEFT SIDE: Afan Oromo + Amharic translation in labels */}
          <div className="left-col">
            <div className="section-subtitle"><i className="fas fa-language"></i> Afaan Oromo / አማርኛ</div>
            <div className="field-group">
              <label>Magaa Guutuu: <span className="lang-badge">Afaan Oromo</span> <span className="lang-badge">ሙሉ ስም</span></label>
              <input 
                type="text" 
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Eg. Ahmad Taha Hussein / አህመድ ታሀ ሁሴን"
              />
            </div>
            <div className="field-group">
              <label>Umrii: <span className="lang-badge">Afaan Oromo</span> <span className="lang-badge">እድሜ</span></label>
              <input 
                type="number" 
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                placeholder="Jahaa / ዕድሜ"
              />
            </div>
            <div className="field-group">
              <label>Magaalaa: <span className="lang-badge">Afaan Oromo</span> <span className="lang-badge">ከተማ</span></label>
              <input 
                type="text" 
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Finfinnee / አዲስ አበባ"
              />
            </div>
            <div className="field-group">
              <label>Saala: <span className="lang-badge">Afaan Oromo</span> <span className="lang-badge">ጾታ</span></label>
              <select 
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
              >
                <option value="Dhiirraa (Dhiiraa) / ወንድ">Dhiirraa (Dhiiraa) / ወንድ</option>
                <option value="Dubartii">Dubartii / ሴት</option>
                <option value="Kan biraa">Kan biraa / ሌላ</option>
              </select>
            </div>
            <div className="field-group">
              <label>Ganda: <span className="lang-badge">Village/District</span> <span className="lang-badge">ወረዳ</span></label>
              <input 
                type="text" 
                value={formData.village}
                onChange={(e) => handleInputChange('village', e.target.value)}
                placeholder="Ganda X, Wereda 03"
              />
            </div>
            <div className="field-group">
              <label>Masjiid: <span className="lang-badge">Mosque</span> <span className="lang-badge">መስጊድ</span></label>
              <input 
                type="text" 
                value={formData.mosque}
                onChange={(e) => handleInputChange('mosque', e.target.value)}
                placeholder="Masjid Al-Furqaan / መስጊድ አልፉርቃን"
              />
            </div>
            <div className="field-group">
              <label>Telefoon: <span className="lang-badge">Phone</span> <span className="lang-badge">ስልክ</span></label>
              <input 
                type="tel" 
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+251 91 123 4567 / +251 91 123 4567"
              />
            </div>
          </div>

          {/* RIGHT SIDE: English + Amharic Context */}
          <div className="right-col">
            <div className="section-subtitle"><i className="fas fa-globe"></i> English / Amharic Context</div>
            <div className="field-group">
              <label>Full Name (ሙሉ ስም):</label>
              <input 
                type="text" 
                value={formData.fullNameEn}
                onChange={(e) => handleInputChange('fullNameEn', e.target.value)}
                placeholder="Full name / ሙሉ ስም"
              />
            </div>
            <div className="field-group">
              <label>Age (እድሜ):</label>
              <input 
                type="number" 
                value={formData.ageEn}
                onChange={(e) => handleInputChange('ageEn', e.target.value)}
                placeholder="Years / ዓመት"
              />
            </div>
            <div className="field-group">
              <label>City/Town (ከተማ):</label>
              <input 
                type="text" 
                value={formData.cityEn}
                onChange={(e) => handleInputChange('cityEn', e.target.value)}
                placeholder="e.g., Adama / አዳማ"
              />
            </div>
            <div className="field-group">
              <label>Gender (ጾታ):</label>
              <select 
                value={formData.genderEn}
                onChange={(e) => handleInputChange('genderEn', e.target.value)}
              >
                <option value="Male / ወንድ">Male / ወንድ</option>
                <option value="Female / ሴት">Female / ሴት</option>
                <option value="Other / ሌላ">Other / ሌላ</option>
              </select>
            </div>
            <div className="field-group">
              <label>Village/District (ወረዳ):</label>
              <input 
                type="text" 
                value={formData.villageEn}
                onChange={(e) => handleInputChange('villageEn', e.target.value)}
                placeholder="Wereda / ወረዳ"
              />
            </div>
            <div className="field-group">
              <label>Mosque (መስጊድ):</label>
              <input 
                type="text" 
                value={formData.mosqueEn}
                onChange={(e) => handleInputChange('mosqueEn', e.target.value)}
                placeholder="Jamaa Masjid / መስጊድ"
              />
            </div>
            <div className="field-group">
              <label>Phone (ስልክ):</label>
              <input 
                type="tel" 
                value={formData.phoneEn}
                onChange={(e) => handleInputChange('phoneEn', e.target.value)}
                placeholder="Phone number / ስልክ ቁጥር"
              />
            </div>
          </div>
        </div>

        {/* Section Header (Haala Hirmaannaa) */}
        <div className="participation-header">
          <div className="section-title">
            Haala Hirmaannaa <small>(የተሳትፎ ሁኔታ)</small>
          </div>
          <div className="inline-hint"><i className="fas fa-hand-peace"></i> Participation Status</div>
        </div>

        {/* Checkbox Options Bottom Half */}
        <div className="checkbox-section">
          <div className="options-grid">
            {[
              { value: "Yaadaa (Shuraa) / በሀሳብ (በሹራ)", hint: "በሀሳብ (በሹራ)", label: "Yaadaa (Shuraa)" },
              { value: "Mallaqaan / በገንዘብ", hint: "በገንዘብ", label: "Mallaqaan", extra: "(By Money)" },
              { value: "Meeshaalee / የቁሳቁስ ድጋፍ (የማምረት)", hint: "የቁሳቁስ ድጋፍ (ማምረት)", label: "Meeshaalee", extra: "(Materials/Equipment)" },
              { value: "Dhiyeessii / በአቅርቦት", hint: "በአቅርቦት", label: "Dhiyeessii", extra: "(Supply)" },
              { value: "Hundaan / በሁሉም", hint: "በሁሉም", label: "Hundaan", extra: "(By All)" }
            ].map((option, index) => (
              <label key={index} className="checkbox-card">
                <input 
                  type="checkbox" 
                  value={option.value}
                  checked={formData.participation.includes(option.value)}
                  onChange={(e) => handleParticipationChange(option.value, e.target.checked)}
                  className="participOpt"
                />
                <label>
                  {option.label} <span className="trans-hint">{option.hint}</span>
                  {option.extra && <><br /><span style={{fontSize: '0.7rem'}}>{option.extra}</span></>}
                </label>
              </label>
            ))}
          </div>
        </div>

        {/* Action buttons + live output summary */}
        <div className="action-buttons">
          <button onClick={resetForm} disabled={isLoading}>
            <i className="fas fa-eraser"></i> አጽዳ / Reset
          </button>
          <button onClick={collectInformation} className="primary" disabled={isLoading}>
            <i className="fas fa-database"></i> {isLoading ? 'Saving...' : 'መረጃ ሰብስብ / Collect Information'}
          </button>
        </div>

        {/* dynamic output panel to display collected data */}
        <div className="output-area" dangerouslySetInnerHTML={{ __html: output }} />
        
        <footer>
          <i className="fas fa-mosque"></i> Noor Al Imaan —  نور الإيمان  —  መረጃ ሰብሳቢ መድረክ
        </footer>
      </div>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          background: linear-gradient(145deg, #e9f0f5 0%, #d9e2ec 100%);
          font-family: 'Inter', 'Noto Sans Arabic', sans-serif;
          padding: 2rem 1.5rem;
          color: #1e2a3e;
        }

        .main-container {
          max-width: 1400px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 2.5rem;
          box-shadow: 0 25px 45px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          transition: all 0.2s ease;
        }

        .header {
          background: #0b2b26;
          background-image: radial-gradient(circle at 10% 20%, rgba(255,215,150,0.08) 2%, transparent 2.5%);
          background-size: 28px 28px;
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          border-bottom: 4px solid #cbb26a;
        }

        .header-left, .header-right {
          flex: 1;
          display: flex;
          align-items: center;
        }

        .header-left {
          justify-content: flex-start;
        }

        .header-right {
          justify-content: flex-end;
          gap: 1.2rem;
          flex-wrap: wrap;
        }

        .noor-title {
          font-size: 1.7rem;
          font-weight: 800;
          letter-spacing: 1px;
          color: #F9E2A1;
          text-shadow: 0 1px 2px rgba(0,0,0,0.2);
          background: rgba(0,0,0,0.2);
          padding: 0.3rem 1rem;
          border-radius: 40px;
          backdrop-filter: blur(2px);
        }

        .arabic-noor {
          font-family: 'Noto Sans Arabic', sans-serif;
          font-size: 1.5rem;
          font-weight: 600;
          color: #FDEEB3;
          background: rgba(0,0,0,0.2);
          padding: 0.2rem 1rem;
          border-radius: 40px;
        }

        .logo-circle {
          background: #ffefcf;
          width: 70px;
          height: 70px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 18px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,240,0.8);
          border: 2px solid #e9c468;
          margin: 0 1rem;
        }

        .logo-circle i {
          font-size: 2.8rem;
          color: #b87c2e;
          text-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }

        .logo-circle img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          display: block;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }

        .info-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 2rem;
          padding: 2rem 2rem 1rem 2rem;
          background: #fefcf7;
          border-bottom: 1px solid #e2e8f0;
        }

        .left-col, .right-col {
          flex: 1;
          min-width: 260px;
          background: #ffffff;
          border-radius: 1.5rem;
          padding: 1.2rem 1.5rem;
          box-shadow: 0 8px 18px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.05);
          border: 1px solid #ece9e0;
        }

        .section-subtitle {
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
          color: #7c5e2c;
          margin-bottom: 1rem;
          border-left: 4px solid #cbb26a;
          padding-left: 0.75rem;
        }

        .field-group {
          margin-bottom: 1.2rem;
          display: flex;
          flex-direction: column;
        }

        .field-group label {
          font-weight: 600;
          font-size: 0.9rem;
          color: #2c3e3b;
          margin-bottom: 0.3rem;
          display: flex;
          align-items: baseline;
          gap: 8px;
          flex-wrap: wrap;
        }

        .lang-badge {
          font-size: 0.7rem;
          background: #f1efe7;
          padding: 0.2rem 0.6rem;
          border-radius: 20px;
          color: #5a4a2a;
          font-weight: normal;
        }

        input, select {
          width: 100%;
          padding: 0.8rem 1rem;
          border-radius: 1rem;
          border: 1px solid #ddd6c8;
          background: #fffbf5;
          font-size: 0.95rem;
          transition: 0.2s;
          font-family: inherit;
        }

        input:focus, select:focus {
          outline: none;
          border-color: #cbb26a;
          box-shadow: 0 0 0 3px rgba(203,178,106,0.2);
        }

        .participation-header {
          background: #f3eee2;
          margin: 0.5rem 2rem 0 2rem;
          border-radius: 1.5rem;
          padding: 0.9rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          flex-wrap: wrap;
          border-left: 6px solid #b68b40;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2c4b42;
        }

        .section-title small {
          font-size: 1rem;
          font-weight: 500;
          color: #5e6e5c;
          margin-left: 12px;
        }

        .checkbox-section {
          padding: 1.5rem 2rem 2.5rem 2rem;
        }

        .options-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.2rem;
          margin-top: 1rem;
        }

        .checkbox-card {
          background: #fdfaf4;
          border-radius: 1.2rem;
          padding: 0.8rem 1.2rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          border: 1px solid #e7dfce;
          transition: all 0.2s;
          cursor: pointer;
        }

        .checkbox-card:hover {
          background: #fff7ea;
          border-color: #cbb26a;
          transform: translateY(-2px);
        }

        .checkbox-card input {
          width: 22px;
          height: 22px;
          accent-color: #b68b40;
          margin: 0;
          flex-shrink: 0;
        }

        .checkbox-card label {
          font-weight: 600;
          font-size: 1rem;
          color: #2e3b32;
          cursor: pointer;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: baseline;
        }

        .checkbox-card .trans-hint {
          font-weight: 400;
          font-size: 0.8rem;
          color: #7b6b4a;
          background: #ece5d8;
          padding: 0.2rem 0.7rem;
          border-radius: 20px;
        }

        .action-buttons {
          padding: 1rem 2rem 2rem 2rem;
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          flex-wrap: wrap;
          border-top: 1px solid #ece3d4;
          background: #fffcf5;
        }

        button {
          border: none;
          padding: 0.8rem 1.8rem;
          font-weight: 600;
          border-radius: 2rem;
          font-size: 0.95rem;
          cursor: pointer;
          background: #f2e5d2;
          color: #3b3a2a;
          transition: 0.2s;
          font-family: inherit;
        }

        button.primary {
          background: #2c5a4f;
          color: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        button.primary:hover {
          background: #1f423a;
          transform: scale(0.98);
        }

        button:hover:not(:disabled) {
          background: #e5d8c2;
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .output-area {
          background: #faf7f0;
          margin: 0 2rem 2rem 2rem;
          padding: 1rem 1.5rem;
          border-radius: 1.2rem;
          font-size: 0.9rem;
          border: 1px solid #e9dfcd;
          font-family: monospace;
          white-space: pre-wrap;
          color: #2d3e3a;
          max-height: 200px;
          overflow-y: auto;
        }

        .inline-hint {
          font-size: 0.7rem;
          color: #80755a;
        }

        footer {
          text-align: center;
          font-size: 0.75rem;
          color: #8f7e5e;
          padding: 1rem;
          border-top: 1px solid #eee5d8;
        }

        @media (max-width: 780px) {
          body { padding: 1rem; }
          .header-left, .header-right { justify-content: center; margin: 0.3rem 0; }
          .logo-circle { width: 55px; height: 55px; }
          .noor-title { font-size: 1.2rem; }
          .participation-header { margin: 0 1rem; }
          .info-grid { padding: 1.5rem; }
          .checkbox-section { padding: 1rem 1.5rem; }
        }
      `}</style>
    </>
  )
}
