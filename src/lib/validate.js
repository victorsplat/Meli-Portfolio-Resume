const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_BASE64_LENGTH = MAX_IMAGE_SIZE * 1.37; // base64 is ~37% larger

export function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 500);
}

export function validateEmail(email) {
  if (typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validateCPF(cpf) {
  if (typeof cpf !== 'string') return false;
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(digits[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(digits[10])) return false;
  return true;
}

export function validateCEP(cep) {
  if (typeof cep !== 'string') return false;
  return /^\d{5}-?\d{3}$/.test(cep.trim());
}

export function validatePhone(phone) {
  if (typeof phone !== 'string') return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 11;
}

export function validateImage(image) {
  if (typeof image !== 'string') return { valid: false, error: 'Invalid image data' };

  if (image.length > MAX_BASE64_LENGTH) {
    return { valid: false, error: 'Image too large (max 10MB)' };
  }

  const match = image.match(/^data:([^;]+);/);
  if (!match) return { valid: false, error: 'Invalid image format' };

  const mimeType = match[1].toLowerCase();
  if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
    return { valid: false, error: `Unsupported image type: ${mimeType}. Allowed: JPEG, PNG, WebP, GIF, AVIF` };
  }

  return { valid: true };
}

export function validateApplication(body) {
  const errors = {};

  if (!body.name || sanitize(body.name).length < 2) errors.name = 'Name is required (min 2 characters)';
  if (!body.email || !validateEmail(body.email)) errors.email = 'Valid email is required';
  if (!body.phone || !validatePhone(body.phone)) errors.phone = 'Valid phone is required (10-11 digits)';
  if (!body.cpf || !validateCPF(body.cpf)) errors.cpf = 'Valid CPF is required (11 digits)';
  if (!body.cep || !validateCEP(body.cep)) errors.cep = 'Valid CEP is required (8 digits)';
  if (!body.birthDate) {
    errors.birthDate = 'Date of birth is required';
  } else {
    const date = new Date(body.birthDate);
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    if (isNaN(date.getTime()) || age < 16 || age > 120) errors.birthDate = 'You must be at least 16 years old';
  }
  if (!body.experience) errors.experience = 'Experience level is required';
  if (!body.availability) errors.availability = 'Availability is required';

  const allowedExp = ['none', '1', '1-2', '3+'];
  if (body.experience && !allowedExp.includes(body.experience)) errors.experience = 'Invalid experience value';

  const allowedAvailability = ['morning', 'afternoon', 'night'];
  if (body.availability && !allowedAvailability.includes(body.availability)) errors.availability = 'Invalid availability value';

  if (body.skills && !Array.isArray(body.skills)) errors.skills = 'Skills must be an array';
  if (body.skills && body.skills.length > 20) errors.skills = 'Too many skills';

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      name: sanitize(body.name),
      email: sanitize(body.email),
      phone: body.phone.replace(/\D/g, '').slice(0, 11),
      cpf: body.cpf.replace(/\D/g, '').slice(0, 11),
      cep: body.cep.replace(/\D/g, '').slice(0, 8),
      experience: body.experience,
      availability: body.availability,
      birthDate: body.birthDate || '',
      isPcd: body.isPcd === 'yes' ? 'yes' : 'no',
      deficiency: body.isPcd === 'yes' ? sanitize(body.deficiency || '') : '',
      race: sanitize(body.race || ''),
      civilState: sanitize(body.civilState || ''),
      education: sanitize(body.education || ''),
      gender: sanitize(body.gender || ''),
      skills: Array.isArray(body.skills) ? body.skills.map(s => sanitize(s)).filter(Boolean).slice(0, 20) : [],
    }
  };
}
