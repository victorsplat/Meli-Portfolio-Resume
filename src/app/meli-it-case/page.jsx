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
    name: '', email: '', phone: '', cpf: '', cep: '', experience: '', availability: '',
    isPcd: '', race: '', civilState: '', education: '', gender: '', skills: []
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        skills: checked ? [...prev.skills, value] : prev.skills.filter(s => s !== value)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  const handleSubmit = (e) => { e.preventDefault(); setSubmitted(true); };

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
                      <input type="text" name="name" value={formData.name} onChange={handleChange} required className="input" placeholder={t('meliCase.namePlaceholder')} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('meliCase.email')}</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} required className="input" placeholder={t('meliCase.emailPlaceholder')} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('meliCase.phone')}</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="input" placeholder={t('meliCase.phonePlaceholder')} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('meliCase.cpf')}</label>
                      <input type="text" name="cpf" value={formData.cpf} onChange={handleChange} required className="input" placeholder={t('meliCase.cpfPlaceholder')} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('meliCase.cep')}</label>
                      <input type="text" name="cep" value={formData.cep} onChange={handleChange} required className="input" placeholder={t('meliCase.cepPlaceholder')} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('meliCase.experience')}</label>
                      <select name="experience" value={formData.experience} onChange={handleChange} required className="input">
                        <option value="">{t('meliCase.experiencePlaceholder')}</option>
                        <option value="none">{t('meliCase.expNone')}</option>
                        <option value="1">{t('meliCase.expLess1')}</option>
                        <option value="1-2">{t('meliCase.exp1to2')}</option>
                        <option value="3+">{t('meliCase.exp3plus')}</option>
                      </select>
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
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">{t('meliCase.race')}</label>
                        <select name="race" value={formData.race} onChange={handleChange} className="input">
                          <option value="">{t('meliCase.experiencePlaceholder')}</option>
                          {['White', 'Black', 'Brown', 'Yellow', 'Indigenous', 'Other'].map(r => (
                            <option key={r} value={r.toLowerCase()}>{t('meliCase.race' + r)}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">{t('meliCase.civilState')}</label>
                        <select name="civilState" value={formData.civilState} onChange={handleChange} className="input">
                          <option value="">{t('meliCase.experiencePlaceholder')}</option>
                          {['Single', 'Married', 'Divorced', 'Widowed', 'Stable'].map(c => (
                            <option key={c} value={c.toLowerCase()}>{t('meliCase.civil' + c)}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">{t('meliCase.education')}</label>
                        <select name="education" value={formData.education} onChange={handleChange} className="input">
                          <option value="">{t('meliCase.experiencePlaceholder')}</option>
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
                          <option value="">{t('meliCase.experiencePlaceholder')}</option>
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
                        <label key={shift} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="availability" value={shift.toLowerCase()} onChange={handleChange} required className="w-4 h-4 text-accent" />
                          <span>{shift}</span>
                        </label>
                      ))}
                    </div>
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

                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}>
                  <button type="submit" className="btn w-full mt-8 text-lg">
                    <FaBriefcase className="mr-2" />
                    {t('meliCase.submit')}
                  </button>
                </motion.div>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      <MeliFooter />
    </div>
  );
}
