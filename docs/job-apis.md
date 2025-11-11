# Job APIs Documentation

## Overview

Job APIs handle public job listings and job-related operations that don't require authentication.

## Base URL
```
/api
```

## Endpoints

### 1. Get All Jobs

**GET** `/api/all-jobs`

Get all visible job postings with company and category information.

#### Description
This endpoint returns all job postings that are marked as visible. It includes company details and category information for each job.

#### Response

**Success (200):**
```json
{
  "success": true,
  "message": "Jobs fetched successfully",
  "jobData": [
    {
      "_id": "job_id",
      "title": "Software Engineer",
      "location": {
        "city": "New York",
        "state": "NY",
        "country": "USA",
        "pincode": "10001"
      },
      "description": "We are looking for a skilled software engineer to join our team...",
      "salaryMin": 50000,
      "salaryMax": 80000,
      "jobType": "full-time",
      "experienceLevel": "mid",
      "skills": [
        "JavaScript",
        "React",
        "Node.js",
        "MongoDB"
      ],
      "category": {
        "_id": "category_id",
        "type": "Technology"
      },
      "companyId": {
        "_id": "company_id",
        "name": "Tech Corp",
        "email": "hr@techcorp.com",
        "image": "company_logo_url"
      },
      "employmentType": "permanent",
      "remoteOption": "hybrid",
      "visible": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "_id": "job_id_2",
      "title": "Marketing Manager",
      "location": {
        "city": "San Francisco",
        "state": "CA",
        "country": "USA",
        "pincode": "94102"
      },
      "description": "We need an experienced marketing manager to lead our marketing efforts...",
      "salaryMin": 60000,
      "salaryMax": 90000,
      "jobType": "full-time",
      "experienceLevel": "senior",
      "skills": [
        "Digital Marketing",
        "SEO",
        "Social Media",
        "Analytics"
      ],
      "category": {
        "_id": "category_id_2",
        "type": "Marketing"
      },
      "companyId": {
        "_id": "company_id_2",
        "name": "Marketing Solutions",
        "email": "careers@marketingsolutions.com",
        "image": "company_logo_url_2"
      },
      "employmentType": "permanent",
      "remoteOption": "remote",
      "visible": true,
      "createdAt": "2024-01-02T00:00:00.000Z",
      "updatedAt": "2024-01-02T00:00:00.000Z"
    }
  ]
}
```

**Error (500):**
```json
{
  "success": false,
  "message": "Job fetching failed"
}
```

---

## Job Data Structure

### Job Object Properties

| Property | Type | Description |
|----------|------|-------------|
| `_id` | string | Unique job identifier |
| `title` | string | Job title |
| `location` | object | Job location details |
| `location.city` | string | City name |
| `location.state` | string | State/Province |
| `location.country` | string | Country |
| `location.pincode` | string | Postal/ZIP code (optional) |
| `description` | string | Detailed job description |
| `salaryMin` | number | Minimum salary (optional) |
| `salaryMax` | number | Maximum salary (optional) |
| `jobType` | string | Type of job (full-time, part-time, contract, internship, temporary) |
| `experienceLevel` | string | Required experience level (entry, mid, senior, executive) |
| `skills` | array | Required skills for the job |
| `category` | object | Job category information |
| `category._id` | string | Category ID |
| `category.type` | string | Category name |
| `companyId` | object | Company information |
| `companyId._id` | string | Company ID |
| `companyId.name` | string | Company name |
| `companyId.email` | string | Company email |
| `companyId.image` | string | Company logo URL |
| `employmentType` | string | Employment type (permanent, contract, freelance) |
| `remoteOption` | string | Remote work option (remote, hybrid, on-site) |
| `visible` | boolean | Whether job is visible to public |
| `createdAt` | string | Job creation timestamp |
| `updatedAt` | string | Job last update timestamp |

---

## Job Types

### Job Type Enum
- `full-time` - Full-time employment
- `part-time` - Part-time employment
- `contract` - Contract-based work
- `internship` - Internship position
- `temporary` - Temporary position

### Experience Level Enum
- `entry` - Entry level (0-2 years)
- `mid` - Mid level (2-5 years)
- `senior` - Senior level (5+ years)
- `executive` - Executive level (10+ years)

### Employment Type Enum
- `permanent` - Permanent employment
- `contract` - Contract employment
- `freelance` - Freelance work

### Remote Option Enum
- `remote` - Fully remote work
- `hybrid` - Hybrid (mix of remote and office)
- `on-site` - On-site work only

---

## Usage Examples

### Get All Jobs

```bash
curl -X GET http://localhost:5000/api/all-jobs
```

### JavaScript/Fetch Example

```javascript
// Get all jobs
fetch('http://localhost:5000/api/all-jobs')
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('Jobs:', data.jobData);
      // Process job data
      data.jobData.forEach(job => {
        console.log(`Job: ${job.title} at ${job.companyId.name}`);
        console.log(`Location: ${job.location.city}, ${job.location.state}`);
        console.log(`Salary: $${job.salaryMin} - $${job.salaryMax}`);
        console.log(`Type: ${job.jobType} (${job.employmentType})`);
        console.log(`Remote: ${job.remoteOption}`);
        console.log(`Skills: ${job.skills.join(', ')}`);
        console.log('---');
      });
    } else {
      console.error('Error:', data.message);
    }
  })
  .catch(error => {
    console.error('Network error:', error);
  });
```

### React Example

```jsx
import React, { useState, useEffect } from 'react';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/all-jobs');
        const data = await response.json();
        
        if (data.success) {
          setJobs(data.jobData);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Failed to fetch jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) return <div>Loading jobs...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Available Jobs</h1>
      {jobs.map(job => (
        <div key={job._id} className="job-card">
          <h2>{job.title}</h2>
          <p><strong>Company:</strong> {job.companyId.name}</p>
          <p><strong>Location:</strong> {job.location.city}, {job.location.state}, {job.location.country}</p>
          <p><strong>Type:</strong> {job.jobType} - {job.employmentType}</p>
          <p><strong>Remote:</strong> {job.remoteOption}</p>
          <p><strong>Experience:</strong> {job.experienceLevel}</p>
          {job.salaryMin && job.salaryMax && (
            <p><strong>Salary:</strong> ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}</p>
          )}
          <p><strong>Skills:</strong> {job.skills.join(', ')}</p>
          <p><strong>Category:</strong> {job.category.type}</p>
          <p>{job.description}</p>
        </div>
      ))}
    </div>
  );
};

export default JobList;
```

---

## Filtering and Search

While the basic endpoint doesn't support filtering, you can implement client-side filtering:

### Client-Side Filtering Example

```javascript
// Filter jobs by location
const filterJobsByLocation = (jobs, city) => {
  return jobs.filter(job => 
    job.location.city.toLowerCase().includes(city.toLowerCase())
  );
};

// Filter jobs by job type
const filterJobsByType = (jobs, jobType) => {
  return jobs.filter(job => job.jobType === jobType);
};

// Filter jobs by salary range
const filterJobsBySalary = (jobs, minSalary, maxSalary) => {
  return jobs.filter(job => {
    if (!job.salaryMin || !job.salaryMax) return false;
    return job.salaryMin >= minSalary && job.salaryMax <= maxSalary;
  });
};

// Filter jobs by skills
const filterJobsBySkills = (jobs, requiredSkills) => {
  return jobs.filter(job => 
    requiredSkills.every(skill => 
      job.skills.some(jobSkill => 
        jobSkill.toLowerCase().includes(skill.toLowerCase())
      )
    )
  );
};

// Combined filtering
const filterJobs = (jobs, filters) => {
  let filteredJobs = jobs;
  
  if (filters.location) {
    filteredJobs = filterJobsByLocation(filteredJobs, filters.location);
  }
  
  if (filters.jobType) {
    filteredJobs = filterJobsByType(filteredJobs, filters.jobType);
  }
  
  if (filters.minSalary && filters.maxSalary) {
    filteredJobs = filterJobsBySalary(filteredJobs, filters.minSalary, filters.maxSalary);
  }
  
  if (filters.skills && filters.skills.length > 0) {
    filteredJobs = filterJobsBySkills(filteredJobs, filters.skills);
  }
  
  return filteredJobs;
};

// Usage
const filters = {
  location: 'New York',
  jobType: 'full-time',
  minSalary: 50000,
  maxSalary: 100000,
  skills: ['JavaScript', 'React']
};

const filteredJobs = filterJobs(allJobs, filters);
```

---

## Error Handling

### Common Error Scenarios

1. **Server Error (500)**
   - Database connection issues
   - Server configuration problems
   - Internal server errors

2. **Network Errors**
   - Connection timeout
   - Network unavailable
   - DNS resolution issues

### Error Handling Example

```javascript
const fetchJobsWithErrorHandling = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/all-jobs');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      return data.jobData;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error fetching jobs:', error);
    
    // Handle different types of errors
    if (error.name === 'TypeError') {
      console.error('Network error - check your connection');
    } else if (error.message.includes('HTTP error')) {
      console.error('Server error - try again later');
    } else {
      console.error('Unexpected error:', error.message);
    }
    
    throw error;
  }
};
```

---

## Performance Considerations

1. **Caching**: Consider implementing client-side caching for job data
2. **Pagination**: For large datasets, implement pagination
3. **Lazy Loading**: Load job details on demand
4. **Debouncing**: Implement search debouncing for better performance

### Caching Example

```javascript
class JobCache {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}

const jobCache = new JobCache();

const fetchJobsWithCache = async () => {
  const cacheKey = 'all-jobs';
  const cachedJobs = jobCache.get(cacheKey);
  
  if (cachedJobs) {
    console.log('Returning cached jobs');
    return cachedJobs;
  }
  
  try {
    const jobs = await fetchJobsWithErrorHandling();
    jobCache.set(cacheKey, jobs);
    return jobs;
  } catch (error) {
    console.error('Failed to fetch jobs:', error);
    throw error;
  }
};
```

---

## Notes

1. **Public Endpoint**: This endpoint doesn't require authentication
2. **Visible Jobs Only**: Only jobs marked as visible are returned
3. **Company Information**: Company details are included in the response
4. **Category Information**: Job categories are populated
5. **Real-time Data**: Data is fetched in real-time from the database
6. **No Pagination**: All visible jobs are returned in a single request
7. **No Filtering**: Basic endpoint doesn't support server-side filtering

## Related Endpoints

- **User Job Applications**: `/api/apply-job` (requires authentication)
- **Company Job Management**: `/api/post-job` (requires company authentication)
- **Company Posted Jobs**: `/api/company/posted-jobs` (requires company authentication)
