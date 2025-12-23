// @ts-nocheck

'use client';

import React from 'react';
import { SCHOOLS, SCHOOL_LABELS } from '@/utils/systemPrompt';
import '@/styles/SchoolSelector.css';

const SchoolSelector = ({ selectedSchool, onSchoolChange }) => {
  const schools = [
    { value: SCHOOLS.GENERAL, label: SCHOOL_LABELS[SCHOOLS.GENERAL] },
    { value: SCHOOLS.HANAFI, label: SCHOOL_LABELS[SCHOOLS.HANAFI] },
    { value: SCHOOLS.SHAFII, label: SCHOOL_LABELS[SCHOOLS.SHAFII] },
    { value: SCHOOLS.MALIKI, label: SCHOOL_LABELS[SCHOOLS.MALIKI] },
    { value: SCHOOLS.HANBALI, label: SCHOOL_LABELS[SCHOOLS.HANBALI] }
  ];

  return (
    <div className="school-selector">

      <select
        id="school-select"
        className="school-selector__select"
        value={selectedSchool}
        onChange={(e) => onSchoolChange(e.target.value)}
        aria-label="Select school of thought"
      >
        {schools.map((school) => (
          <option key={school.value} value={school.value}>
            {school.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SchoolSelector;

