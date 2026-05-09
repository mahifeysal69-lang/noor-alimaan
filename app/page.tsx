import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Head from 'next/head'

// Local storage keys
const STORAGE_KEY = 'noor-al-imaan-form-data'
const SESSION_KEY = 'noor-al-imaan-session-id'

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://khghiyvahojawixjmlsv.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnaGl5aXlvamFoYWxpbWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxODAwMjIsImV4cCI6MjA5Mzc1NjAyMn0.0Kmq-WhSWSGx_IjX3wjWW5rhfxYBx87d-zANNNJWzbA'
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
  
  // Interactive features
  comment: string
  donationAmount: string
  donationScreenshot: string
  materials: Array<{
    type: string
    quantity: string
    size: string
    custom: string
  }>
}

// Donation flow states
type DonationStep = 'amount' | 'payment' | 'screenshot' | 'complete'

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
    participation: [],
    
    // Interactive features
    comment: '',
    donationAmount: '',
    donationScreenshot: '',
    materials: []
  })

  const [output, setOutput] = useState<string>('📋 ውጤት / Output will appear here after clicking "Collect Information"')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')
  const [donationStep, setDonationStep] = useState<DonationStep>('amount')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false)

  // Initialize session and load data from localStorage on mount
  useEffect(() => {
    try {
      // Initialize or get existing session
      let currentSessionId = localStorage.getItem(SESSION_KEY)
      if (!currentSessionId) {
        currentSessionId = crypto.randomUUID()
        localStorage.setItem(SESSION_KEY, currentSessionId)
      }
      setSessionId(currentSessionId)

      // Load saved form data
      const savedData = localStorage.getItem(STORAGE_KEY)
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        setFormData(prev => ({
          ...prev,
          ...parsedData
        }))
      }
    } catch (error) {
      console.error('Error initializing session:', error)
    }
  }, [])

  // Save data to localStorage whenever formData changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData))
    } catch (error) {
      console.error('Error saving data:', error)
    }
  }, [formData])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleParticipationChange = (value: string, checked: boolean) => {
    setFormData(prev => {
      const newParticipation = checked 
        ? [...prev.participation, value]
        : prev.participation.filter(item => item !== value)
      return {
        ...prev,
        participation: newParticipation
      }
    })
  }

  const handleCommentChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      comment: value
    }))
  }

  const handleDonationAmountChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      donationAmount: value
    }))
  }

  const handleDonationScreenshotChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      donationScreenshot: value
    }))
  }

  const handleMaterialChange = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const newMaterials = [...prev.materials]
      if (!newMaterials[index]) {
        newMaterials[index] = { type: '', quantity: '', size: '', custom: '' }
      }
      newMaterials[index] = { ...newMaterials[index], [field]: value }
      return {
        ...prev,
        materials: newMaterials
      }
    })
  }

  const submitComment = async () => {
    if (!formData.comment.trim()) {
      setOutput(prev => prev + `<br><br><span style="color: red;">❌ Please enter a comment before submitting.</span>`)
      return
    }

    setIsSubmittingComment(true)
    try {
      // For now, save to localStorage. In production, this would save to Supabase
      const comments = JSON.parse(localStorage.getItem('noor-al-imaan-comments') || '[]')
      comments.push({
        id: crypto.randomUUID(),
        sessionId,
        message: formData.comment.trim(),
        admin_reviewed: false,
        created_at: new Date().toISOString()
      })
      localStorage.setItem('noor-al-imaan-comments', JSON.stringify(comments))
      
      setOutput(prev => prev + `<br><br><span style="color: green;">✅ Comment submitted successfully! Admin will review it.</span>`)
      setFormData(prev => ({ ...prev, comment: '' }))
    } catch (error) {
      console.error('Error submitting comment:', error)
      setOutput(prev => prev + `<br><br><span style="color: red;">❌ Error submitting comment. Please try again.</span>`)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleDonationStep = (step: DonationStep) => {
    setDonationStep(step)
  }

  const uploadScreenshot = async (file: File) => {
    if (!file) return

    setIsUploadingScreenshot(true)
    try {
      // For now, save file info to localStorage. In production, upload to Supabase Storage
      const screenshotInfo = {
        name: file.name,
        size: file.size,
        type: file.type,
        sessionId,
        created_at: new Date().toISOString()
      }
      
      localStorage.setItem('noor-al-imaan-screenshot', JSON.stringify(screenshotInfo))
      handleDonationScreenshotChange(file.name)
      setOutput(prev => prev + `<br><br><span style="color: green;">✅ Screenshot uploaded successfully!</span>`)
      handleDonationStep('complete')
    } catch (error) {
      console.error('Error uploading screenshot:', error)
      setOutput(prev => prev + `<br><br><span style="color: red;">❌ Error uploading screenshot. Please try again.</span>`)
    } finally {
      setIsUploadingScreenshot(false)
    }
  }

  const addMaterial = () => {
    setFormData(prev => ({
      ...prev,
      materials: [...prev.materials, { type: '', quantity: '', size: '', custom: '' }]
    }))
  }

  const removeMaterial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index)
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
      participation: [],
      comment: '',
      donationAmount: '',
      donationScreenshot: '',
      materials: []
    })
    
    // Reset states
    setDonationStep('amount')
    
    // Clear all localStorage data
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem('noor-al-imaan-comments')
    localStorage.removeItem('noor-al-imaan-screenshot')
    
    // Generate new session
    const newSessionId = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, newSessionId)
    setSessionId(newSessionId)
    
    setOutput('✨ አጽዳ / Form reset. Enter new data.')
  }

  const collectInformation = async () => {
    setIsLoading(true)
    
    // Build formatted output
    let formattedOutput = "═ ✦ معلومات التسجيل ✦ ═\n"
    formattedOutput += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
    formattedOutput += "🔹 LEFT SIDE (Afaan Oromo / አማርኛ):\n"
    formattedOutput += `   ሙም: ${formData.fullName}\n`
    formattedOutput += `   ዕድ: ${formData.age}\n`
    formattedOutput += `   ከተለ: ${formData.city}\n`
    formattedOutput += `   ጾብ: ${formData.gender}\n`
    formattedOutput += `   ወልቅ: ${formData.village}\n`
    formattedOutput += `   ማስግ: ${formData.mosque}\n`
    formattedOutput += `   ስልክ: ${formData.phone}\n`
    formattedOutput += "\n"
    formattedOutput += "🔹 RIGHT SIDE (English / አማርኛ):\n"
    formattedOutput += `   Name: ${formData.fullNameEn}\n`
    formattedOutput += `   Age: ${formData.ageEn}\n`
    formattedOutput += `   City: ${formData.cityEn}\n`
    formattedOutput += `   Gender: ${formData.genderEn}\n`
    formattedOutput += `   Village: ${formData.villageEn}\n`
    formattedOutput += `   Mosque: ${formData.mosqueEn}\n`
    formattedOutput += `   Phone: ${formData.phoneEn}\n`
    formattedOutput += "\n"
    formattedOutput += "🔹 PARTICIPATION (ተራቅት / ምምታ):\n"
    formattedOutput += `   ${formData.participation.join(', ')}\n`
    
    // Add interactive data to output
    if (formData.participation.includes("Yaadaa (Shuraa) / በሀሳብ (በሹራ)")) {
      formattedOutput += "\n📝 COMMENT (በሀሳብ):"
      formattedOutput += `   ${formData.comment}\n`
    }
    
    if (formData.participation.includes("Mallaqaan / በገንዘብ")) {
      formattedOutput += "\n💰 DONATION (በገንዘብ):"
      formattedOutput += `   Amount: ${formData.donationAmount} ETB\n`
      formattedOutput += `   Screenshot: ${formData.donationScreenshot}\n`
    }
    
    if (formData.participation.includes("Meeshaalee / የቁሳቁስ ድጋፍ (የማምረት)")) {
      formattedOutput += "\n📦 MATERIALS (የቁሳቁስ ድጋፍ):"
      formData.materials.forEach((material, index) => {
        if (material.type.trim() && material.quantity.trim()) {
          formattedOutput += `   ${index + 1}. ${material.type}`
          if (material.custom.trim()) {
            formattedOutput += ` (${material.custom})`
          }
          formattedOutput += ` - Qty: ${material.quantity}`
          if (material.size.trim()) {
            formattedOutput += `, Size: ${material.size}`
          }
          formattedOutput += "\n"
        }
      })
    }
    
    formattedOutput += "\n═════════════════════════════════\n"
    formattedOutput += "✅ መረጃት ተቀባም / Data collected successfully!"
    
    setOutput(formattedOutput)
    
    try {
      // Save main registration data to Supabase
      const { data: registrationData, error: registrationError } = await supabase
        .from('user_registrations')
        .insert([
          {
            // Afan Oromo/Amharic data
            full_name_oromo: formData.fullName,
            age_oromo: parseInt(formData.age),
            city_oromo: formData.city,
            gender_oromo: formData.gender,
            village_oromo: formData.village,
            mosque_oromo: formData.mosque,
            phone_oromo: formData.phone,
            
            // English/Amharic data
            full_name_english: formData.fullNameEn,
            age_english: parseInt(formData.ageEn),
            city_english: formData.cityEn,
            gender_english: formData.genderEn,
            village_english: formData.villageEn,
            mosque_english: formData.mosqueEn,
            phone_english: formData.phoneEn,
            
            // Participation options
            participation_idea: formData.participation.includes("Yaadaa (Shuraa) / በሀሳብ (በሹራ)"),
            participation_money: formData.participation.includes("Mallaqaan / በገንዘብ"),
            participation_material: formData.participation.includes("Meeshaalee / የቁሳቁስ ድጋፍ (የማምረት)"),
            participation_provision: formData.participation.includes("Dhiyeessii / በአቅርቦት"),
            participation_all: formData.participation.includes("Hundaan / በሁሉም")
          }
        ])
        .select()
        .single()

      if (registrationError) {
        console.error('Registration error:', registrationError)
        setOutput(prev => prev + `<br><br><span style="color: red;">❌ Error saving registration: ${registrationError.message}</span>`)
        return
      }

      const registrationId = registrationData.id

      // Save comments if provided
      if (formData.participation.includes("Yaadaa (Shuraa) / በሀሳብ (በሹራ)") && formData.comment.trim()) {
        const { error: commentError } = await supabase
          .from('comments')
          .insert([
            {
              user_registration_id: registrationId,
              message: formData.comment.trim()
            }
          ])

        if (commentError) {
          console.error('Comment error:', commentError)
          setOutput(prev => prev + `<br><br><span style="color: red;">❌ Error saving comment: ${commentError.message}</span>`)
        }
      }

      // Save donations if provided
      if (formData.participation.includes("Mallaqaan / በገንዘብ") && formData.donationAmount) {
        const { error: donationError } = await supabase
          .from('donations')
          .insert([
            {
              user_registration_id: registrationId,
              amount: parseFloat(formData.donationAmount),
              screenshot_url: formData.donationScreenshot
            }
          ])

        if (donationError) {
          console.error('Donation error:', donationError)
          setOutput(prev => prev + `<br><br><span style="color: red;">❌ Error saving donation: ${donationError.message}</span>`)
        }
      }

      // Save materials if provided
      const validMaterials = formData.materials.filter(m => m.type.trim() && m.quantity.trim())
      if (validMaterials.length > 0) {
        const materialData = validMaterials.map(material => ({
          user_registration_id: registrationId,
          material_type: material.type.trim(),
          quantity: parseInt(material.quantity),
          size: material.size.trim() || null
        }))

        const { error: materialError } = await supabase
          .from('materials')
          .insert(materialData)

        if (materialError) {
          console.error('Material error:', materialError)
          setOutput(prev => prev + `<br><br><span style="color: red;">❌ Error saving materials: ${materialError.message}</span>`)
        }
      }

      if (!registrationError && !commentError && !donationError && !materialError) {
        console.log('All data saved successfully:', registrationData)
        setOutput(prev => prev + `<br><br><span style="color: green;">✅ All data saved successfully to database!</span>`)
        
        // Clear localStorage after successful submission
        localStorage.removeItem(STORAGE_KEY)
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
          <div className="header-center">
            <div className="logo-container">
              <img 
                src="/noor-logo.png" 
                alt="Noor Al Imaan Logo" 
                className="logo-image"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement
                  if (fallback) fallback.style.display = 'inline-block'
                }}
              />
              <div className="logo-fallback">
                <i className="fas fa-star-of-life"></i>
              </div>
            </div>
          </div>
          <div className="header-right">
            <span className="noor-title-arabic">نور الإيمان</span>
          </div>
        </div>

        {/* MAIN FORM CONTAINER */}
        <div className="form-container">
          {/* LEFT SIDE - Afaan Oromo/Amharic + English/Amharic */}
          <div className="info-grid">
            {/* LEFT COLUMN - Afaan Oromo/Amharic */}
            <div className="info-column">
              <div className="section-title">
                Maqaalee <small>(መረጃት)</small>
              </div>
              <div className="field-group">
                <label>Maqaalee Keessaa (ሙም ቁልቅ):</label>
                <input 
                  type="text" 
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Maqaalee Keessaa / ሙም ቁልቅ"
                />
              </div>
              <div className="field-group">
                <label>Umrii (ዕድ):</label>
                <input 
                  type="number" 
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  placeholder="Umrii / ዕድ"
                />
              </div>
              <div className="field-group">
                <label>Magaala (ከተለ):</label>
                <input 
                  type="text" 
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Magaala / ከተለ"
                />
              </div>
              <div className="field-group">
                <label>Saffisa (ጾብ):</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                >
                  <option value="Dhiirraa (Dhiiraa) / ወንድ">Dhiirraa (Dhiiraa) / ወንድ</option>
                  <option value="Dubartoo (Dubartoo) / ደባርቱ">Dubartoo (Dubartoo) / ደባርቱ</option>
                </select>
              </div>
              <div className="field-group">
                <label>Ganda (ወልቅ):</label>
                <input 
                  type="text" 
                  value={formData.village}
                  onChange={(e) => handleInputChange('village', e.target.value)}
                  placeholder="Ganda / ወልቅ"
                />
              </div>
              <div className="field-group">
                <label>Masjidka (ማስግ):</label>
                <input 
                  type="text" 
                  value={formData.mosque}
                  onChange={(e) => handleInputChange('mosque', e.target.value)}
                  placeholder="Masjidka / ማስግ"
                />
              </div>
              <div className="field-group">
                <label> Bilbilaa (ስልክ):</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Bilbilaa / ስልክ ቁጥር"
                />
              </div>
            </div>

            {/* RIGHT COLUMN - English/Amharic */}
            <div className="info-column">
              <div className="section-title">
                Name <small>(English / አማርኛ)</small>
              </div>
              <div className="field-group">
                <label>Full Name:</label>
                <input 
                  type="text" 
                  value={formData.fullNameEn}
                  onChange={(e) => handleInputChange('fullNameEn', e.target.value)}
                  placeholder="Full name"
                />
              </div>
              <div className="field-group">
                <label>Age (ዕድ):</label>
                <input 
                  type="number" 
                  value={formData.ageEn}
                  onChange={(e) => handleInputChange('ageEn', e.target.value)}
                  placeholder="Age / ዕድ"
                />
              </div>
              <div className="field-group">
                <label>City (ከተለ):</label>
                <input 
                  type="text" 
                  value={formData.cityEn}
                  onChange={(e) => handleInputChange('cityEn', e.target.value)}
                  placeholder="City / ከተለ"
                />
              </div>
              <div className="field-group">
                <label>Gender (ጾብ):</label>
                <select
                  value={formData.genderEn}
                  onChange={(e) => handleInputChange('genderEn', e.target.value)}
                >
                  <option value="Male / ወንድ">Male / ወንድ</option>
                  <option value="Female / ደባርቱ">Female / ደባርቱ</option>
                </select>
              </div>
              <div className="field-group">
                <label>Village (ወልቅ):</label>
                <input 
                  type="text" 
                  value={formData.villageEn}
                  onChange={(e) => handleInputChange('villageEn', e.target.value)}
                  placeholder="Village / ወልቅ"
                />
              </div>
              <div className="field-group">
                <label>Mosque (ማስግ):</label>
                <input 
                  type="text" 
                  value={formData.mosqueEn}
                  onChange={(e) => handleInputChange('mosqueEn', e.target.value)}
                  placeholder="Mosque / ማስግ"
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
              <div key={index} className="option-item">
                <input 
                  type="checkbox" 
                  value={option.value}
                  checked={formData.participation.includes(option.value)}
                  onChange={(e) => handleParticipationChange(option.value, e.target.checked)}
                  className="participOpt"
                />
                <div className="option-label">
                  <span className="option-text">{option.label}</span>
                  <span className="option-hint">{option.hint}</span>
                  {option.extra && <span className="option-extra">{option.extra}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Sections */}
        {formData.participation.includes("Yaadaa (Shuraa) / በሀሳብ (በሹራ)") && (
          <div className="interactive-section">
            <div className="section-subtitle"><i className="fas fa-comment"></i> Yaadaa (Shuraa) - Comments</div>
            <div className="interactive-box">
              <div className="field-group">
                <label>Share your ideas and suggestions for Noor Al Imaan:</label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => handleCommentChange(e.target.value)}
                  placeholder="Please share your thoughts, suggestions, or feedback..."
                  rows={4}
                  className="comment-textarea"
                />
              </div>
              <button 
                onClick={submitComment}
                disabled={isSubmittingComment}
                className="send-comment-btn"
              >
                <i className="fas fa-paper-plane"></i> {isSubmittingComment ? 'Sending...' : 'Send Comment'}
              </button>
            </div>
          </div>
        )}

        {formData.participation.includes("Mallaqaan / በገንዘብ") && (
          <div className="interactive-section">
            <div className="section-subtitle"><i className="fas fa-donate"></i> Mallaqaan - Donation</div>
            <div className="interactive-box">
              {/* Step 1: Select Amount */}
              {donationStep === 'amount' && (
                <div>
                  <h4>Step 1: Select Donation Amount</h4>
                  <div className="donation-amount">
                    <label>Select Donation Amount (ETB):</label>
                    <select
                      value={formData.donationAmount}
                      onChange={(e) => handleDonationAmountChange(e.target.value)}
                    >
                      <option value="">Select amount...</option>
                      <option value="100">100 ETB</option>
                      <option value="250">250 ETB</option>
                      <option value="500">500 ETB</option>
                      <option value="1000">1,000 ETB</option>
                      <option value="2500">2,500 ETB</option>
                      <option value="5000">5,000 ETB</option>
                      <option value="10000">10,000 ETB</option>
                    </select>
                  </div>
                  {formData.donationAmount && (
                    <button
                      onClick={() => handleDonationStep('payment')}
                      className="donation-next-btn"
                    >
                      Next: Payment Details →
                    </button>
                  )}
                </div>
              )}

              {/* Step 2: Payment Information */}
              {donationStep === 'payment' && (
                <div>
                  <h4>Step 2: Complete Payment</h4>
                  <div className="bank-info">
                    <p><strong>Selected Amount:</strong> {formData.donationAmount} ETB</p>
                    <div className="bank-account">
                      <i className="fas fa-university"></i>
                      <span>CBE - 1000745191178</span>
                      <button onClick={() => navigator.clipboard.writeText('CBE-1000745191178')}>
                        <i className="fas fa-copy"></i> Copy
                      </button>
                    </div>
                  </div>
                  <div className="payment-instructions">
                    <h5>Payment Instructions:</h5>
                    <ol>
                      <li>Copy bank account number above</li>
                      <li>Send {formData.donationAmount} ETB via mobile banking or bank transfer</li>
                      <li>Take a screenshot of transaction confirmation</li>
                      <li>Click "I have paid" below to upload your screenshot</li>
                    </ol>
                  </div>
                  <div className="telegram-info">
                    <p>After payment, you can also send screenshot to: <a href="https://t.me/MAH_ZAK1" target="_blank" rel="noopener noreferrer">@MAH_ZAK1</a></p>
                  </div>
                  <div className="donation-buttons">
                    <button
                      onClick={() => handleDonationStep('amount')}
                      className="donation-back-btn"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => handleDonationStep('screenshot')}
                      className="donation-next-btn"
                    >
                      I have paid, upload screenshot →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Upload Screenshot */}
              {donationStep === 'screenshot' && (
                <div>
                  <h4>Step 3: Upload Payment Screenshot</h4>
                  <div className="screenshot-info">
                    <label>Upload your payment confirmation screenshot:</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          uploadScreenshot(file)
                        }
                      }}
                      disabled={isUploadingScreenshot}
                    />
                    {isUploadingScreenshot && (
                      <p>Uploading screenshot...</p>
                    )}
                  </div>
                  <div className="donation-buttons">
                    <button
                      onClick={() => handleDonationStep('payment')}
                      className="donation-back-btn"
                    >
                      ← Back
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Complete */}
              {donationStep === 'complete' && (
                <div>
                  <h4>✅ Donation Process Complete!</h4>
                  <div className="donation-complete">
                    <p><strong>Amount:</strong> {formData.donationAmount} ETB</p>
                    <p><strong>Screenshot:</strong> {formData.donationScreenshot}</p>
                    <p><strong>Status:</strong> Pending admin verification</p>
                  </div>
                  <div className="telegram-info">
                    <p>Thank you for your donation! Your payment will be verified shortly.</p>
                    <p>If you haven't already, you can also send screenshot to: <a href="https://t.me/MAH_ZAK1" target="_blank" rel="noopener noreferrer">@MAH_ZAK1</a></p>
                  </div>
                  <button
                    onClick={() => handleDonationStep('amount')}
                    className="donation-new-btn"
                  >
                    Make Another Donation
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {formData.participation.includes("Meeshaalee / የቁሳቁስ ድጋፍ (የማምረት)") && (
          <div className="interactive-section">
            <div className="section-subtitle"><i className="fas fa-box"></i> Meeshaalee - Materials</div>
            <div className="interactive-box">
              {formData.materials.map((material, index) => (
                <div key={index} className="material-item">
                  <div className="field-group">
                    <label>Material Type:</label>
                    <select
                      value={material.type}
                      onChange={(e) => handleMaterialChange(index, 'type', e.target.value)}
                    >
                      <option value="">Select material...</option>
                      <option value="clothes">Clothes</option>
                      <option value="shoes">Shoes</option>
                      <option value="mattress">Mattress</option>
                      <option value="blankets">Blankets</option>
                      <option value="books">Books</option>
                      <option value="other">Other (specify below)</option>
                    </select>
                  </div>
                  {material.type === 'other' && (
                    <div className="field-group">
                      <label>Specify material:</label>
                      <input
                        type="text"
                        value={material.custom}
                        onChange={(e) => handleMaterialChange(index, 'custom', e.target.value)}
                        placeholder="Please specify material type"
                      />
                    </div>
                  )}
                  <div className="field-group">
                    <label>Quantity:</label>
                    <input
                      type="number"
                      value={material.quantity}
                      onChange={(e) => handleMaterialChange(index, 'quantity', e.target.value)}
                      placeholder="Quantity"
                    />
                  </div>
                  <div className="field-group">
                    <label>Size (if applicable):</label>
                    <input
                      type="text"
                      value={material.size}
                      onChange={(e) => handleMaterialChange(index, 'size', e.target.value)}
                      placeholder="Size (e.g., M, L, XL)"
                    />
                  </div>
                  <button
                    onClick={() => removeMaterial(index)}
                    className="remove-material-btn"
                  >
                    <i className="fas fa-trash"></i> Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addMaterial}
                className="add-material-btn"
              >
                <i className="fas fa-plus"></i> Add Another Material
              </button>
            </div>
          </div>
        )}

        {/* Action buttons + live output summary */}
        <div className="action-buttons">
          <button onClick={resetForm} disabled={isLoading}>
            <i className="fas fa-eraser"></i> አጽዳ / Reset
          </button>
          <button onClick={collectInformation} className="primary" disabled={isLoading}>
            <i className="fas fa-database"></i> {isLoading ? 'Saving...' : 'መረጃት ሰብስቅ / Collect Information'}
          </button>
        </div>

        {/* dynamic output panel to display collected data */}
        <div className="output-area" dangerouslySetInnerHTML={{ __html: output }} />
        
        <style jsx>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Inter', 'Noto Sans Arabic', sans-serif;
          }
          
          body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 2rem;
          }
          
          .main-container {
            max-width: 1400px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 2rem;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
          }
          
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem 2rem;
            background: linear-gradient(90deg, #1e3c72, #2a5298);
            color: white;
            border-bottom: 3px solid rgba(255, 255, 255, 0.1);
          }
          
          .header-left, .header-right {
            flex: 1;
          }
          
          .header-center {
            flex: 0 1rem;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          
          .noor-title {
            font-size: 1.3rem;
            font-weight: 700;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
          }
          
          .noor-title-arabic {
            font-size: 1.3rem;
            font-weight: 700;
            font-family: 'Noto Sans Arabic', sans-serif;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
          }
          
          .logo-container {
            position: relative;
            width: 70px;
            height: 70px;
          }
          
          .logo-image {
            width: 100%;
            height: 100%;
            object-fit: contain;
            border-radius: 50%;
          }
          
          .logo-fallback {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: none;
            align-items: center;
            justify-content: center;
            background: #f8f9fa;
            border-radius: 50%;
            font-size: 2rem;
            color: #1e3c72;
          }
          
          .form-container {
            padding: 2rem;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            margin-bottom: 2rem;
          }
          
          .info-column {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          
          .section-title {
            font-size: 1.3rem;
            font-weight: 700;
            color: #1e3c72;
            margin-bottom: 1rem;
            text-align: center;
            padding: 1rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 1rem;
          }
          
          .field-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .field-group label {
            font-weight: 600;
            color: #374151;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
          }
          
          .field-group input,
          .field-group select,
          .field-group textarea {
            padding: 1rem;
            border: 2px solid #e5e7eb;
            border-radius: 0.75rem;
            font-size: 1rem;
            transition: all 0.2s;
            background: white;
          }
          
          .field-group input:focus,
          .field-group select:focus,
          .field-group textarea:focus {
            outline: none;
            border-color: #1e3c72;
            box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.1);
          }
          
          .participation-header {
            text-align: center;
            margin: 2rem 0;
            position: relative;
          }
          
          .participation-header::before {
            content: '';
            position: absolute;
            top: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 60%;
            height: 2px;
            background: linear-gradient(90deg, #fbbf24, #f59e0b);
            border-radius: 2px;
          }
          
          .inline-hint {
            display: inline-block;
            background: #fbbf24;
            color: white;
            padding: 0.3rem 0.8rem;
            border-radius: 2rem;
            font-size: 0.8rem;
            font-weight: 600;
            margin-left: 1rem;
          }
          
          .checkbox-section {
            background: rgba(255, 255, 255, 0.1);
            padding: 2rem;
            border-radius: 1rem;
          }
          
          .options-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1rem;
          }
          
          .option-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            background: white;
            border-radius: 0.75rem;
            transition: all 0.2s;
          }
          
          .option-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          
          .participOpt {
            width: 1.4rem;
            height: 1.4rem;
            cursor: pointer;
          }
          
          .option-label {
            display: flex;
            flex-direction: column;
            flex: 1;
          }
          
          .option-text {
            font-weight: 600;
            color: #374151;
          }
          
          .option-hint {
            font-size: 0.8rem;
            color: #6b7280;
            font-style: italic;
          }
          
          .option-extra {
            font-size: 0.8rem;
            color: #059669;
            font-weight: 600;
          }
          
          .interactive-section {
            background: rgba(255, 255, 255, 0.1);
            padding: 2rem;
            border-radius: 1rem;
            margin: 2rem 0;
          }
          
          .section-subtitle {
            font-size: 1.2rem;
            font-weight: 700;
            color: #1e3c72;
            margin-bottom: 1rem;
            text-align: center;
            padding: 0.8rem;
            background: rgba(30, 64, 175, 0.1);
            border-radius: 0.75rem;
          }
          
          .interactive-box {
            background: white;
            padding: 2rem;
            border-radius: 1rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          
          .comment-textarea {
            min-height: 120px;
            resize: vertical;
          }
          
          .send-comment-btn {
            background: #1e3c72;
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 0.75rem;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            margin-top: 1rem;
          }
          
          .send-comment-btn:hover {
            background: #c53030;
            transform: translateY(-1px);
          }
          
          .send-comment-btn:disabled {
            background: #9ca3af;
            cursor: not-allowed;
          }
          
          .bank-info {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 1rem;
            margin: 1rem 0;
          }
          
          .bank-account {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin: 1rem 0;
          }
          
          .bank-account span {
            font-family: monospace;
            font-size: 1.1rem;
            font-weight: 700;
            color: #1e3c72;
          }
          
          .bank-account button {
            background: #1e3c72;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            font-size: 0.8rem;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .bank-account button:hover {
            background: #c53030;
          }
          
          .donation-amount {
            margin: 1rem 0;
          }
          
          .donation-amount label {
            font-weight: 600;
            color: #374151;
            margin-bottom: 0.5rem;
          }
          
          .donation-amount select {
            width: 100%;
            padding: 1rem;
            border: 2px solid #e5e7eb;
            border-radius: 0.75rem;
            font-size: 1rem;
            background: white;
          }
          
          .screenshot-info {
            margin: 1rem 0;
          }
          
          .screenshot-info label {
            font-weight: 600;
            color: #374151;
            margin-bottom: 0.5rem;
          }
          
          .screenshot-info input {
            width: 100%;
            padding: 1rem;
            border: 2px dashed #e5e7eb;
            border-radius: 0.75rem;
            background: rgba(249, 250, 251, 0.1);
          }
          
          .telegram-info {
            background: #e8f5e8;
            padding: 1rem;
            border-radius: 1rem;
            margin: 1rem 0;
            text-align: center;
          }
          
          .telegram-info p {
            margin: 0.5rem 0;
          }
          
          .telegram-info a {
            color: #1e3c72;
            text-decoration: none;
            font-weight: 600;
          }
          
          .telegram-info a:hover {
            text-decoration: underline;
          }
          
          .material-item {
            background: rgba(249, 250, 251, 0.1);
            padding: 1.5rem;
            border-radius: 1rem;
            margin-bottom: 1rem;
          }
          
          .material-item label {
            font-weight: 600;
            color: #374151;
            margin-bottom: 0.5rem;
          }
          
          .material-item select,
          .material-item input {
            width: 100%;
            padding: 0.8rem;
            border: 2px solid #e5e7eb;
            border-radius: 0.5rem;
            font-size: 0.9rem;
            background: white;
          }
          
          .remove-material-btn {
            background: #dc3545;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            font-size: 0.8rem;
            cursor: pointer;
            transition: all 0.2s;
            margin-top: 1rem;
          }
          
          .remove-material-btn:hover {
            background: #c82333;
          }
          
          .add-material-btn {
            background: #16a34a;
            color: white;
            border: none;
            padding: 1rem 1.5rem;
            border-radius: 1rem;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            margin-top: 1rem;
          }
          
          .add-material-btn:hover {
            background: #218838;
            transform: translateY(-1px);
          }

          /* Donation Flow Styles */
          .donation-next-btn {
            background: #28a745;
            color: white;
            border: none;
            padding: 0.8rem 1.5rem;
            border-radius: 1rem;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            transition: 0.2s;
            margin-top: 1rem;
          }

          .donation-next-btn:hover {
            background: #218838;
            transform: translateY(-1px);
          }

          .donation-back-btn {
            background: #6c757d;
            color: white;
            border: none;
            padding: 0.8rem 1.5rem;
            border-radius: 1rem;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            transition: 0.2s;
            margin-right: 1rem;
          }

          .donation-back-btn:hover {
            background: #5a6268;
          }

          .donation-new-btn {
            background: #17a2b8;
            color: white;
            border: none;
            padding: 0.8rem 1.5rem;
            border-radius: 1rem;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            transition: 0.2s;
            margin-top: 1rem;
          }

          .donation-new-btn:hover {
            background: #138496;
            transform: translateY(-1px);
          }

          .donation-buttons {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 1.5rem;
          }

          .payment-instructions {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 1rem;
            margin: 1rem 0;
            border-left: 4px solid #28a745;
          }

          .payment-instructions h5 {
            color: #28a745;
            margin-bottom: 0.5rem;
          }

          .payment-instructions ol {
            margin: 0;
            padding-left: 1.5rem;
          }

          .payment-instructions li {
            margin-bottom: 0.5rem;
          }

          .donation-complete {
            background: #d4edda;
            padding: 1rem;
            border-radius: 1rem;
            margin: 1rem 0;
            border: 1px solid #c3e6cb;
          }

          .donation-complete p {
            margin: 0.5rem 0;
            color: #155724;
          }
          
          .action-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin: 2rem 0;
          }
          
          .action-buttons button {
            padding: 1rem 2rem;
            border: none;
            border-radius: 0.75rem;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            flex: 1;
          }
          
          .action-buttons button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
          }
          
          .action-buttons button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
          }
          
          .action-buttons button.primary {
            background: linear-gradient(45deg, #1e3c72, #2a5298);
            color: white;
          }
          
          .action-buttons button.primary:hover {
            background: linear-gradient(45deg, #c53030, #d63031);
          }
          
          .output-area {
            background: rgba(255, 255, 255, 0.95);
            border: 2px solid #e5e7eb;
            border-radius: 1rem;
            padding: 2rem;
            margin-top: 2rem;
            font-family: monospace;
            white-space: pre-wrap;
            max-height: 400px;
            overflow-y: auto;
            line-height: 1.5;
          }
          
          @media (max-width: 780px) {
            body { padding: 1rem; }
            .header-left, .header-right { justify-content: center; margin: 0.3rem 0; }
            .logo-container img { width: 55px; height: 55px; }
            .noor-title { font-size: 1.2rem; }
            .participation-header { margin: 0 1rem; }
            .info-grid { padding: 1.5rem; }
            .checkbox-section { padding: 1rem 1.5rem; }
            .options-grid { grid-template-columns: 1fr; }
          }
        `}</style>
      </div>
    </>
  )
}
