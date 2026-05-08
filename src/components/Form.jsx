import React, { useState } from 'react';
import Header from './Header';
import InputField from './InputField';
import Checkbox from './Checkbox';
import { supabase } from '../config/supabase';
import '../styles/App.css';
import '../styles/Form.css';

const Form = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    city: '',
    gender: '',
    district: '',
    mosque: '',
    participation: {
      idea: false,
      money: false,
      material: false,
      provision: false,
      all: false
    }
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    
    // If "all" is checked, uncheck all others
    if (name === 'all' && checked) {
      setFormData(prev => ({
        ...prev,
        participation: {
          idea: false,
          money: false,
          material: false,
          provision: false,
          all: true
        }
      }));
    } else if (name !== 'all' && checked) {
      // If any other option is checked, uncheck "all"
      setFormData(prev => ({
        ...prev,
        participation: {
          ...prev.participation,
          [name]: checked,
          all: false
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        participation: {
          ...prev.participation,
          [name]: checked
        }
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.age.trim()) {
      newErrors.age = 'Age is required';
    } else if (isNaN(formData.age) || formData.age < 1) {
      newErrors.age = 'Please enter a valid age';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.gender.trim()) {
      newErrors.gender = 'Gender is required';
    }
    
    if (!formData.district.trim()) {
      newErrors.district = 'District is required';
    }
    
    if (!formData.mosque.trim()) {
      newErrors.mosque = 'Mosque is required';
    }
    
    const hasParticipation = Object.values(formData.participation).some(value => value === true);
    if (!hasParticipation) {
      newErrors.participation = 'Please select at least one participation option';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        // Prepare data for Supabase
        const submissionData = {
          full_name: formData.fullName,
          age: parseInt(formData.age),
          city: formData.city,
          gender: formData.gender,
          district: formData.district,
          mosque: formData.mosque,
          participation_idea: formData.participation.idea,
          participation_money: formData.participation.money,
          participation_material: formData.participation.material,
          participation_provision: formData.participation.provision,
          participation_all: formData.participation.all,
          created_at: new Date().toISOString()
        };

        // Insert data into Supabase
        const { data, error } = await supabase
          .from('registrations')
          .insert([submissionData]);

        if (error) {
          console.error('Supabase error:', error);
          alert('Error submitting form. Please try again.');
          return;
        }

        console.log('Form submitted successfully:', data);
        alert('Registration submitted successfully!');
        
        // Reset form after successful submission
        setFormData({
          fullName: '',
          age: '',
          city: '',
          gender: '',
          district: '',
          mosque: '',
          participation: {
            idea: false,
            money: false,
            material: false,
            provision: false,
            all: false
          }
        });
        
      } catch (error) {
        console.error('Submission error:', error);
        alert('Error submitting form. Please try again.');
      }
    }
  };

  return (
    <div className="app-container">
      <Header />
      
      <form onSubmit={handleSubmit}>
        {/* Information Fields Section */}
        <div className="form-section">
          <div className="info-fields-grid">
            <InputField
              primaryLabel="Full Name"
              secondaryLabel="Maqaan Guutuu"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              name="fullName"
              error={errors.fullName}
            />
            
            <InputField
              primaryLabel="Age"
              secondaryLabel="Umrii"
              value={formData.age}
              onChange={handleInputChange}
              placeholder="Enter your age"
              name="age"
              type="number"
              error={errors.age}
            />
            
            <InputField
              primaryLabel="City"
              secondaryLabel="Magaalaa"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="Enter your city"
              name="city"
              error={errors.city}
            />
            
            <InputField
              primaryLabel="Gender"
              secondaryLabel="Saffisa"
              value={formData.gender}
              onChange={handleInputChange}
              placeholder="Enter your gender"
              name="gender"
              error={errors.gender}
            />
            
            <InputField
              primaryLabel="District"
              secondaryLabel="Aanaa"
              value={formData.district}
              onChange={handleInputChange}
              placeholder="Enter your district"
              name="district"
              error={errors.district}
            />
            
            <InputField
              primaryLabel="Mosque"
              secondaryLabel="Miskiiyaa"
              value={formData.mosque}
              onChange={handleInputChange}
              placeholder="Enter your mosque"
              name="mosque"
              error={errors.mosque}
            />
          </div>
        </div>

        {/* Participation Section */}
        <div className="form-section">
          <h2 className="section-title">
            <span className="font-latin">Haala Hirmaannaa</span>
            <span className="font-ethiopic"> (የተሳትፎ ሁኔታ)</span>
          </h2>
          
          <div className="participation-grid">
            <Checkbox
              primaryLabel="Yaadaa (Shuraa)"
              secondaryLabel="በሀሳብ (በሹራ)"
              checked={formData.participation.idea}
              onChange={handleCheckboxChange}
              name="idea"
              id="idea"
            />
            
            <Checkbox
              primaryLabel="Mallaqaan"
              secondaryLabel="በገንዘብ"
              checked={formData.participation.money}
              onChange={handleCheckboxChange}
              name="money"
              id="money"
            />
            
            <Checkbox
              primaryLabel="Geeshaalteea"
              secondaryLabel="የቁሳቁስ ድጋፍ"
              checked={formData.participation.material}
              onChange={handleCheckboxChange}
              name="material"
              id="material"
            />
            
            <Checkbox
              primaryLabel="Dhiyeessii"
              secondaryLabel="በአቅርቦት"
              checked={formData.participation.provision}
              onChange={handleCheckboxChange}
              name="provision"
              id="provision"
            />
            
            <Checkbox
              primaryLabel="Hundaan"
              secondaryLabel="በሁሉም"
              checked={formData.participation.all}
              onChange={handleCheckboxChange}
              name="all"
              id="all"
            />
          </div>
          
          {errors.participation && (
            <div className="error-message" style={{ textAlign: 'center', marginTop: '15px' }}>
              {errors.participation}
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center' }}>
          <button type="submit" className="submit-button">
            Submit Registration
          </button>
        </div>
      </form>
    </div>
  );
};

export default Form;
