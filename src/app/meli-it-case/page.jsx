'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaCheckCircle, FaBriefcase } from 'react-icons/fa';
import { useI18n } from '@/lib/i18n';
import { usePageTitle } from '@/lib/usePageTitle';
import MeliHeroSection from '@/components/MeliHeroSection';
import MeliFeaturesSection from '@/components/MeliFeaturesSection';
import MeliRequirementsSection from '@/components/MeliRequirementsSection';
import MeliFooter from '@/components/MeliFooter';

export default function MeliITCase() {
  usePageTitle('meliCase.title');
  const { t } = useI18n();
  const skillOptions = ['Coding', 'Social', 'Office', 'Excel', 'English', 'Leadership'];
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', cpf: '', birthDate: '', cep: '', experience: '', availability: '',
    isPcd: '', deficiency: '', race: '', civilState: '', education: '', gender: '', skills: []
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  const requiredFields = ['name', 'email', 'phone', 'cpf', 'birthDate', 'cep', 'experience', 'availability'];

  function formatField(name, value) {
    const digits = value.replace(/\D/g, '');
    if (name === 'cpf') {
      return digits
        .replace(/^(\d{3})(\d)/, '$1.$2')
        .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1-$2')
        .slice(0, 14);
    }
    if (name === 'phone') {
      if (digits.length <= 10) {
        return digits
          .replace(/^(\d{2})(\d)/, '($1) $2')
          .replace(/(\d{4})(\d)/, '$1-$2')
          .slice(0, 14);
      }
      return digits
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .slice(0, 15);
    }
    if (name === 'cep') {
      return digits.replace(/^(\d{5})(\d)/, '$1-$2').slice(0, 9);
    }
    return value;
  }

  const validateField = (name, value) => {
    if (!value && requiredFields.includes(name)) return 'required';
    if (name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'formato';
    if (name === 'cpf' && value) {
      const digits = value.replace(/\D/g, '');
      if (digits.length !== 11) return 'digits';
    }
    if (name === 'phone' && value) {
      const digits = value.replace(/\D/g, '');
      if (digits.length < 10 || digits.length > 11) return 'digits';
    }
    if (name === 'cep' && value) {
      const digits = value.replace(/\D/g, '');
      if (digits.length !== 8) return 'digits';
    }
    if (name === 'birthDate' && value) {
      const date = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      if (isNaN(date.getTime()) || age < 16 || age > 120) return 'invalid';
    }
    return null;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newData;
    if (type === 'checkbox') {
      newData = {
        ...formData,
        skills: checked ? [...formData.skills, value] : formData.skills.filter(s => s !== value)
      };
    } else {
      const formatted = ['cpf', 'phone', 'cep'].includes(name) ? formatField(name, value) : value;
      newData = { ...formData, [name]: formatted };
    }
    setFormData(newData);
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    const newTouched = {};
    requiredFields.forEach(field => {
      newTouched[field] = true;
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    setTouched(prev => ({ ...prev, ...newTouched }));
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || data.fields ? Object.values(data.fields).join(', ') : 'Failed to submit');
      }
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error.message || 'Failed to submit application. Please try again.');
      console.error('Submit error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const fieldMessage = (name) => {
    const code = errors[name];
    if (!code) return null;
    const msgs = {
      name: { required: 'Name is required' },
      email: { required: 'Email is required', formato: 'Enter a valid email (user@domain.com)' },
      phone: { required: 'Phone is required', digits: 'Phone must have 10-11 digits' },
      cpf: { required: 'CPF is required', digits: 'CPF must have exactly 11 digits' },
      birthDate: { required: 'Date of birth is required', invalid: 'You must be at least 16 years old' },
      cep: { required: 'CEP is required', digits: 'CEP must have exactly 8 digits' },
      experience: { required: 'Experience level is required' },
      availability: { required: 'Select a shift' },
    };
    return msgs[name]?.[code] || 'Required';
  };

  const inputClass = (name) => {
    const base = 'input';
    if (touched[name] && errors[name]) return `${base} input-error`;
    return base;
  };

  return (
    <div className="min-h-screen bg-bg-app text-text-main overflow-x-hidden">
      <MeliHeroSection />
      <MeliFeaturesSection />
      <MeliRequirementsSection />

      <section id="application-form" className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="title text-3xl text-center mb-4">{t('meliCase.formTitle')}</h2>
            <p className="text-center text-muted mb-10">{t('meliCase.formDesc')}</p>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card text-center p-10"
              >
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaCheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">{t('meliCase.successTitle')}</h3>
                <p className="text-muted mb-6">{t('meliCase.successMsg')}</p>
                <Link href="/" className="btn">{t('meliCase.returnHome')}</Link>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="card p-8">
                <motion.div
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
                  }}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }} className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('meliCase.name')}</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} onBlur={handleBlur} required className={inputClass('name')} placeholder={t('meliCase.namePlaceholder')} />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{fieldMessage('name')}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('meliCase.email')}</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} required className={inputClass('email')} placeholder={t('meliCase.emailPlaceholder')} />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{fieldMessage('email')}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('meliCase.phone')}</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} onBlur={handleBlur} required className={inputClass('phone')} placeholder={t('meliCase.phonePlaceholder')} />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{fieldMessage('phone')}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('meliCase.cpf')}</label>
                      <input type="text" name="cpf" value={formData.cpf} onChange={handleChange} onBlur={handleBlur} required className={inputClass('cpf')} placeholder={t('meliCase.cpfPlaceholder')} />
                      {errors.cpf && <p className="text-red-500 text-xs mt-1">{fieldMessage('cpf')}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('meliCase.birthDate')}</label>
                      <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} onBlur={handleBlur} required className={inputClass('birthDate')} />
                      {errors.birthDate && <p className="text-red-500 text-xs mt-1">{fieldMessage('birthDate')}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('meliCase.cep')}</label>
                      <input type="text" name="cep" value={formData.cep} onChange={handleChange} onBlur={handleBlur} required className={inputClass('cep')} placeholder={t('meliCase.cepPlaceholder')} />
                      {errors.cep && <p className="text-red-500 text-xs mt-1">{fieldMessage('cep')}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('meliCase.experience')}</label>
                      <select name="experience" value={formData.experience} onChange={handleChange} onBlur={handleBlur} required className={inputClass('experience')}>
                        <option value="">{t('meliCase.experiencePlaceholder')}</option>
                        <option value="none">{t('meliCase.expNone')}</option>
                        <option value="1">{t('meliCase.expLess1')}</option>
                        <option value="1-2">{t('meliCase.exp1to2')}</option>
                        <option value="3+">{t('meliCase.exp3plus')}</option>
                      </select>
                      {errors.experience && <p className="text-red-500 text-xs mt-1">{fieldMessage('experience')}</p>}
                    </div>
                  </motion.div>

                  <motion.div
                    variants={{
                      hidden: { opacity: 0 },
                      visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
                    }}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }} className="grid md:grid-cols-2 gap-6 mt-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">{t('meliCase.isPcd')}</label>
                        <div className="flex gap-4">
                          {[t('meliCase.pcdYes'), t('meliCase.pcdNo')].map((opt, i) => (
                            <label key={i} className="flex items-center gap-2 cursor-pointer">
                              <input type="radio" name="isPcd" value={i === 0 ? 'yes' : 'no'} onChange={handleChange} className="w-4 h-4 text-accent" />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                        {formData.isPcd === 'yes' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-3"
                          >
                            <label className="block text-sm font-medium mb-2">{t('meliCase.deficiency')}</label>
                            <input type="text" name="deficiency" value={formData.deficiency} onChange={handleChange} onBlur={handleBlur} className="input" placeholder={t('meliCase.deficiencyPlaceholder')} />
                          </motion.div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">{t('meliCase.race')}</label>
                        <select name="race" value={formData.race} onChange={handleChange} className="input">
                          <option value="">{t('meliCase.selectOption')}</option>
                          {['White', 'Black', 'Brown', 'Yellow', 'Indigenous', 'Other'].map(r => (
                            <option key={r} value={r.toLowerCase()}>{t('meliCase.race' + r)}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">{t('meliCase.civilState')}</label>
                        <select name="civilState" value={formData.civilState} onChange={handleChange} className="input">
                          <option value="">{t('meliCase.selectOption')}</option>
                          {['Single', 'Married', 'Divorced', 'Widowed', 'Stable'].map(c => (
                            <option key={c} value={c.toLowerCase()}>{t('meliCase.civil' + c)}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">{t('meliCase.education')}</label>
                        <select name="education" value={formData.education} onChange={handleChange} className="input">
                          <option value="">{t('meliCase.selectOption')}</option>
                          <option value="highschool">{t('meliCase.eduHighschool')}</option>
                          <option value="associate">{t('meliCase.eduAssociate')}</option>
                          <option value="bachelor">{t('meliCase.eduBachelor')}</option>
                          <option value="postgrad">{t('meliCase.eduPostgrad')}</option>
                          <option value="master">{t('meliCase.eduMaster')}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">{t('meliCase.gender')}</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} className="input">
                          <option value="">{t('meliCase.selectOption')}</option>
                          <option value="male">{t('meliCase.genderMale')}</option>
                          <option value="female">{t('meliCase.genderFemale')}</option>
                          <option value="other">{t('meliCase.genderOther')}</option>
                          <option value="preferNot">{t('meliCase.genderPreferNot')}</option>
                        </select>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <div className="mt-6">
                <label className="block text-sm font-medium mb-2">{t('meliCase.availability')}</label>
                <div className="flex flex-wrap gap-4">
                  {[t('meliCase.morning'), t('meliCase.afternoon'), t('meliCase.night')].map(shift => (
                    <label key={shift} className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg border transition-colors ${formData.availability === shift.toLowerCase() ? 'border-accent bg-accent/10' : 'border-[var(--panel-border)] hover:bg-black/5 dark:hover:bg-white/5'}`}>
                      <input type="radio" name="availability" value={shift.toLowerCase()} onChange={handleChange} required className="w-4 h-4 text-accent" />
                      <span>{shift}</span>
                    </label>
                  ))}
                </div>
                {errors.availability && <p className="text-red-500 text-xs mt-1">{fieldMessage('availability')}</p>}
              </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}>
                  <div className="mt-6">
                    <label className="block text-sm font-medium mb-2">{t('meliCase.skills')}</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {skillOptions.map(s => (
                        <label key={s} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg border border-[var(--panel-border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                          <input type="checkbox" value={s.toLowerCase()} checked={formData.skills.includes(s.toLowerCase())} onChange={handleChange} className="w-4 h-4 text-accent" />
                          <span className="text-sm">{t('meliCase.skill' + s)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {submitError && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm text-center mt-4">
                    {submitError}
                  </motion.p>
                )}
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}>
                  <button type="submit" disabled={submitting} className="btn w-full mt-8 text-lg disabled:opacity-50 disabled:cursor-not-allowed">
                    <FaBriefcase className="mr-2" />
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {t('meliCase.uploading') || 'Submitting...'}
                      </span>
                    ) : t('meliCase.submit')}
                  </button>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="text-xs text-muted text-center mt-4 max-w-md mx-auto leading-relaxed"
                >
                  {t('meliCase.privacyNotice')}
                </motion.p>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      <MeliFooter />
    </div>
  );
}
