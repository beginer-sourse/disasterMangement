import { Request, Response } from 'express';
import DisasterReport from '../models/DisasterReport';
import Comment from '../models/Comment';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary';
import { IReportInput, ApiResponse, PaginatedResponse, IUser } from '../types';
import { wsServer } from '../server';
import { NotificationService } from '../utils/notificationService';

// Helper function to get major cities for a state
function getStateCities(state: string): string[] {
  const stateCityMap: { [key: string]: string[] } = {
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur', 'Amravati', 'Kolhapur', 'Sangli', 'Malegaon', 'Jalgaon', 'Akola', 'Latur', 'Ahmadnagar', 'Dhule', 'Ichalkaranji', 'Parbhani', 'Jalna', 'Bhusawal', 'Panvel', 'Satara', 'Beed', 'Yavatmal', 'Kamptee', 'Gondia', 'Achalpur', 'Osmanabad', 'Nanded', 'Wardha', 'Udgir', 'Aurangabad', 'Amalner', 'Akot', 'Pandharpur', 'Shirpur', 'Lonavla', 'Pimpri', 'Chinchwad', 'Jalna', 'Ambejogai', 'Akola', 'Yavatmal', 'Achalpur', 'Osmanabad', 'Nanded', 'Wardha', 'Udgir', 'Aurangabad', 'Amalner', 'Akot', 'Pandharpur', 'Shirpur', 'Lonavla', 'Pimpri', 'Chinchwad', 'Jalna', 'Ambejogai'],
    'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Dharwad', 'Mangalore', 'Belgaum', 'Gulbarga', 'Davanagere', 'Bellary', 'Bijapur', 'Shimoga', 'Tumkur', 'Raichur', 'Bidar', 'Hospet', 'Hassan', 'Gadag', 'Udupi', 'Robertsonpet', 'Bhadravati', 'Chitradurga', 'Kolar', 'Mandya', 'Udupi', 'Robertsonpet', 'Bhadravati', 'Chitradurga', 'Kolar', 'Mandya'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Tiruppur', 'Ranipet', 'Nagercoil', 'Thanjavur', 'Vellore', 'Erode', 'Tuticorin', 'Dindigul', 'Thoothukkudi', 'Pollachi', 'Rajapalayam', 'Sivakasi', 'Pudukkottai', 'Neyveli', 'Nagapattinam', 'Villupuram', 'Tiruvannamalai', 'Kanchipuram', 'Kumbakonam', 'Cuddalore', 'Karaikudi', 'Nagercoil', 'Thanjavur', 'Vellore', 'Erode', 'Tuticorin', 'Dindigul', 'Thoothukkudi', 'Pollachi', 'Rajapalayam', 'Sivakasi', 'Pudukkottai', 'Neyveli', 'Nagapattinam', 'Villupuram', 'Tiruvannamalai', 'Kanchipuram', 'Kumbakonam', 'Cuddalore', 'Karaikudi'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar', 'Nadiad', 'Morbi', 'Surendranagar', 'Mehsana', 'Bharuch', 'Anand', 'Porbandar', 'Godhra', 'Navsari', 'Veraval', 'Bharuch', 'Anand', 'Porbandar', 'Godhra', 'Navsari', 'Veraval'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Meerut', 'Varanasi', 'Allahabad', 'Bareilly', 'Aligarh', 'Moradabad', 'Saharanpur', 'Gorakhpur', 'Firozabad', 'Jhansi', 'Muzaffarnagar', 'Mathura', 'Shahjahanpur', 'Rampur', 'Modinagar', 'Hapur', 'Etawah', 'Mirzapur', 'Bulandshahr', 'Sambhal', 'Amroha', 'Hardoi', 'Fatehpur', 'Raebareli', 'Orai', 'Sitapur', 'Bahraich', 'Modinagar', 'Hapur', 'Etawah', 'Mirzapur', 'Bulandshahr', 'Sambhal', 'Amroha', 'Hardoi', 'Fatehpur', 'Raebareli', 'Orai', 'Sitapur', 'Bahraich'],
    'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman', 'Malda', 'Baharampur', 'Habra', 'Kharagpur', 'Shantipur', 'Dankuni', 'Dhulian', 'Ranaghat', 'Haldia', 'Raiganj', 'Krishnanagar', 'Nabadwip', 'Medinipur', 'Jalpaiguri', 'Balurghat', 'Basirhat', 'Bankura', 'Chinsurah', 'Purulia', 'Arambagh', 'Tamluk', 'Suri', 'Jangipur', 'Gangarampur', 'Rampurhat', 'Kalimpong', 'Islampur', 'Krishnanagar', 'Nabadwip', 'Medinipur', 'Jalpaiguri', 'Balurghat', 'Basirhat', 'Bankura', 'Chinsurah', 'Purulia', 'Arambagh', 'Tamluk', 'Suri', 'Jangipur', 'Gangarampur', 'Rampurhat', 'Kalimpong', 'Islampur'],
    'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar', 'Bharatpur', 'Sikar', 'Pali', 'Sri Ganganagar', 'Kishangarh', 'Beawar', 'Hanumangarh', 'Dungarpur', 'Sawai Madhopur', 'Churu', 'Jhunjhunu', 'Baran', 'Banswara', 'Dausa', 'Jhalawar', 'Jhunjhunu', 'Baran', 'Banswara', 'Dausa', 'Jhalawar'],
    'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa', 'Murwara', 'Singrauli', 'Katni', 'Guna', 'Damoh', 'Vidisha', 'Mandsaur', 'Neemuch', 'Pithampur', 'Hoshangabad', 'Itarsi', 'Sehore', 'Betul', 'Seoni', 'Datia', 'Shivpuri', 'Guna', 'Damoh', 'Vidisha', 'Mandsaur', 'Neemuch', 'Pithampur', 'Hoshangabad', 'Itarsi', 'Sehore', 'Betul', 'Seoni', 'Datia', 'Shivpuri'],
    'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Palakkad', 'Malappuram', 'Kannur', 'Kasaragod', 'Kollam', 'Alappuzha', 'Pathanamthitta', 'Kottayam', 'Idukki', 'Ernakulam', 'Wayanad', 'Thrissur', 'Palakkad', 'Malappuram', 'Kannur', 'Kasaragod', 'Kollam', 'Alappuzha', 'Pathanamthitta', 'Kottayam', 'Idukki', 'Ernakulam', 'Wayanad'],
    'Andhra Pradesh': ['Visakhapatnam', 'vishakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Tirupati', 'Kadapa', 'Anantapur', 'Chittoor', 'Ongole', 'Eluru', 'Machilipatnam', 'Tenali', 'Proddatur', 'Chilakaluripet', 'Hindupur', 'Nandyal', 'Madanapalle', 'Guntakal', 'Dharmavaram', 'Gudivada', 'Narasaraopet', 'Tadipatri', 'Kadiri', 'Srikakulam', 'Kadiri', 'Srikakulam'],
    'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Ramagundam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Suryapet', 'Miryalaguda', 'Tadepalligudem', 'Kothagudem', 'Mancherial', 'Bodhan', 'Sangareddy', 'Vikarabad', 'Jagtial', 'Nirmal', 'Kamareddy', 'Kothagudem', 'Mancherial', 'Bodhan', 'Sangareddy', 'Vikarabad', 'Jagtial', 'Nirmal', 'Kamareddy'],
    'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif', 'Arrah', 'Begusarai', 'Katihar', 'Munger', 'Chhapra', 'Sitamarhi', 'Motihari', 'Saharsa', 'Hajipur', 'Sasaram', 'Dehri', 'Bettiah', 'Siwan', 'Kishanganj', 'Supaul', 'Jehanabad', 'Aurangabad', 'Buxar', 'Lakhisarai', 'Jamalpur', 'Nawada', 'Forbesganj', 'Bhabua', 'Aurangabad', 'Buxar', 'Lakhisarai', 'Jamalpur', 'Nawada', 'Forbesganj', 'Bhabua'],
    'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Baleshwar', 'Bhadrak', 'Baripada', 'Balangir', 'Jharsuguda', 'Bargarh', 'Paradip', 'Bhadrak', 'Baripada', 'Balangir', 'Jharsuguda', 'Bargarh', 'Paradip'],
    'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Bongaigaon', 'Dhubri', 'Diphu', 'North Lakhimpur', 'Sibsagar', 'Goalpara', 'Barpeta', 'Lanka', 'Mangaldoi', 'Dhubri', 'Diphu', 'North Lakhimpur', 'Sibsagar', 'Goalpara', 'Barpeta', 'Lanka', 'Mangaldoi'],
    'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Firozpur', 'Batala', 'Pathankot', 'Moga', 'Abohar', 'Malerkotla', 'Khanna', 'Phagwara', 'Muktsar', 'Barnala', 'Rajpura', 'Fazilka', 'Kapurthala', 'Sunam', 'Dhuri', 'Tarn Taran', 'Kharar', 'Gobindgarh', 'Muktsar', 'Barnala', 'Rajpura', 'Fazilka', 'Kapurthala', 'Sunam', 'Dhuri', 'Tarn Taran', 'Kharar', 'Gobindgarh'],
    'Haryana': ['Faridabad', 'Gurgaon', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula', 'Kaithal', 'Bhiwani', 'Sirsa', 'Bahadurgarh', 'Jind', 'Thanesar', 'Rewari', 'Palwal', 'Hansi', 'Narnaul', 'Fatehabad', 'Gohana', 'Tohana', 'Narwana', 'Mandi Dabwali', 'Charkhi Dadri', 'Shahbad', 'Pehowa', 'Samalkha', 'Pinjore', 'Ladwa', 'Sohna', 'Safidon', 'Rania', 'Ratia', 'Pundri', 'Narwana', 'Mandi Dabwali', 'Charkhi Dadri', 'Shahbad', 'Pehowa', 'Samalkha', 'Pinjore', 'Ladwa', 'Sohna', 'Safidon', 'Rania', 'Ratia', 'Pundri'],
    'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Phusro', 'Hazaribagh', 'Giridih', 'Ramgarh', 'Jhumri Tilaiya', 'Sahibganj', 'Medininagar', 'Chaibasa', 'Ghatshila', 'Dumka', 'Hazaribagh', 'Giridih', 'Ramgarh', 'Jhumri Tilaiya', 'Sahibganj', 'Medininagar', 'Chaibasa', 'Ghatshila', 'Dumka'],
    'Chhattisgarh': ['Raipur', 'Bhilai', 'Korba', 'Bilaspur', 'Durg', 'Rajnandgaon', 'Raigarh', 'Jagdalpur', 'Ambikapur', 'Bhatapara', 'Dhamtari', 'Mahasamund', 'Dondi', 'Tilda Newra', 'Bilaspur', 'Rajnandgaon', 'Raigarh', 'Jagdalpur', 'Ambikapur', 'Bhatapara', 'Dhamtari', 'Mahasamund', 'Dondi', 'Tilda Newra'],
    'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Kashipur', 'Rudrapur', 'Rishikesh', 'Haldwani', 'Ramnagar', 'Pithoragarh', 'Srinagar', 'Kotdwara', 'Manglaur', 'Mussoorie', 'Tehri', 'Nainital', 'Almora', 'Pithoragarh', 'Srinagar', 'Kotdwara', 'Manglaur', 'Mussoorie', 'Tehri', 'Nainital', 'Almora'],
    'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Palampur', 'Nahan', 'Una', 'Chamba', 'Kullu', 'Baddi', 'Parwanoo', 'Nalagarh', 'Sundarnagar', 'Paonta Sahib', 'Solan', 'Mandi', 'Palampur', 'Nahan', 'Una', 'Chamba', 'Kullu', 'Baddi', 'Parwanoo', 'Nalagarh', 'Sundarnagar', 'Paonta Sahib'],
    'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Mormugao', 'Bicholim', 'Sanquelim', 'Curchorem', 'Quepem', 'Canacona', 'Sanguem', 'Pernem', 'Tiswadi', 'Bardez', 'Salcete', 'Mormugao', 'Bicholim', 'Sanquelim', 'Curchorem', 'Quepem', 'Canacona', 'Sanguem', 'Pernem', 'Tiswadi', 'Bardez', 'Salcete']
  };
  
  return stateCityMap[state] || [];
}

export const createReport = async (req: Request & { user?: IUser }, res: Response): Promise<void> => {
  try {
    console.log('=== REPORT CREATION REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Request files:', req.file);
    console.log('Request headers:', req.headers);
    console.log('User:', req.user);
    
    const { title, description, disasterType, severity, location, coordinates } = req.body;
    
    // Parse multilingual content if it's JSON strings
    let parsedTitle: any = title;
    let parsedDescription: any = description;
    let parsedLocation: any = location;
    
    try {
      if (typeof title === 'string' && title.startsWith('{')) {
        parsedTitle = JSON.parse(title);
      }
      if (typeof description === 'string' && description.startsWith('{')) {
        parsedDescription = JSON.parse(description);
      }
      if (typeof location === 'string' && location.startsWith('{')) {
        parsedLocation = JSON.parse(location);
      }
    } catch (error) {
      console.error('Error parsing multilingual content:', error);
      // Fallback to original values if parsing fails
    }
    
    // Handle coordinates from FormData (coordinates[latitude] and coordinates[longitude])
    let parsedCoordinates = coordinates;
    if (!coordinates && req.body['coordinates[latitude]'] && req.body['coordinates[longitude]']) {
      parsedCoordinates = {
        latitude: parseFloat(req.body['coordinates[latitude]']),
        longitude: parseFloat(req.body['coordinates[longitude]'])
      };
    }
    
    console.log('Parsed coordinates:', parsedCoordinates);
    
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }
    
    const userId = req.user._id.toString();
    const userName = req.user.name;
    const userAvatar = req.user.avatar;

    let mediaData = null;

    // Handle file upload if present
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file.buffer, 'disaster-reports');
        mediaData = {
          url: uploadResult.url,
          type: req.file.mimetype.startsWith('video/') ? 'video' : 'image',
          publicId: uploadResult.publicId
        };
      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        res.status(500).json({
          success: false,
          message: 'Failed to upload media file'
        } as ApiResponse);
        return;
      }
    }

    // Create new report
    const report = new DisasterReport({
      title: parsedTitle,
      description: parsedDescription,
      disasterType,
      severity,
      location: parsedLocation,
      coordinates: parsedCoordinates ? (typeof parsedCoordinates === 'string' ? JSON.parse(parsedCoordinates) : parsedCoordinates) : undefined,
      media: mediaData,
      author: userId,
      authorName: userName,
      authorAvatar: userAvatar
    });

    await report.save();

    // Populate the report with author details for WebSocket broadcast
    const populatedReport = await DisasterReport.findById(report._id)
      .populate('author', 'name email avatar');

    // Broadcast new report to admin clients
    if (wsServer) {
      wsServer.broadcastNewReport(populatedReport);
      wsServer.broadcastAnalyticsUpdate(); // Broadcast analytics update
    }

    res.status(201).json({
      success: true,
      message: 'Report created successfully',
      data: { report: populatedReport }
    } as ApiResponse);
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

export const getReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy as string || 'createdAt';
    const sortOrder = req.query.sortOrder as string || 'desc';
    const severity = req.query.severity as string;
    const status = req.query.status as string;
    const state = req.query.state as string;

    // Build filter object
    const filter: any = {};
    if (severity) filter.severity = severity;
    if (status) filter.status = status;
    if (state) {
      // Filter by state - check if location contains the state name
      // Also include major cities within the state
      const stateCities = getStateCities(state);
      const searchPatterns = [state, ...stateCities];
      
      // Use $in with regex for better matching - use word boundaries for exact matches
      filter.$or = searchPatterns.map(pattern => ({
        location: { 
          $regex: `\\b${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 
          $options: 'i' 
        }
      }));
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const reports = await DisasterReport.find(filter)
      .populate('author', 'name email avatar')
      .populate('comments')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await DisasterReport.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'Reports retrieved successfully',
      data: reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    } as PaginatedResponse<any>);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

export const getReportById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const report = await DisasterReport.findById(id)
      .populate('author', 'name email avatar')
      .populate('comments')
      .populate('verifiedBy', 'name email');

    if (!report) {
      res.status(404).json({
        success: false,
        message: 'Report not found'
      } as ApiResponse);
      return;
    }

    // Increment view count
    report.views += 1;
    await report.save();

    res.status(200).json({
      success: true,
      message: 'Report retrieved successfully',
      data: { report }
    } as ApiResponse);
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

export const updateReport = async (req: Request & { user?: IUser }, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }
    
    const userId = req.user._id.toString();
    const userRole = req.user.role;
    const updateData = req.body;

    const report = await DisasterReport.findById(id);
    if (!report) {
      res.status(404).json({
        success: false,
        message: 'Report not found'
      } as ApiResponse);
      return;
    }

    // Check if user can update this report
    if (report.author !== userId && userRole !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Not authorized to update this report'
      } as ApiResponse);
      return;
    }

    // Update report
    const updatedReport = await DisasterReport.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'name email avatar');

    // Broadcast report update to all clients
    if (wsServer) {
      wsServer.broadcastReportUpdate(updatedReport);
      wsServer.broadcastAnalyticsUpdate(); // Broadcast analytics update
    }

    res.status(200).json({
      success: true,
      message: 'Report updated successfully',
      data: { report: updatedReport }
    } as ApiResponse);
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

export const deleteReport = async (req: Request & { user?: IUser }, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    console.log('=== DELETE REPORT DEBUG ===');
    console.log('Report ID:', id);
    console.log('User:', req.user);
    
    if (!req.user) {
      console.log('No user found in request');
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      } as ApiResponse);
      return;
    }
    
    const userId = req.user._id.toString();
    const userRole = req.user.role;
    
    console.log('Current user ID:', userId);
    console.log('Current user role:', userRole);

    const report = await DisasterReport.findById(id);
    if (!report) {
      console.log('Report not found');
      res.status(404).json({
        success: false,
        message: 'Report not found'
      } as ApiResponse);
      return;
    }

    console.log('Report author:', report.author);
    console.log('Report author type:', typeof report.author);
    console.log('User ID type:', typeof userId);
    console.log('Author === userId:', report.author === userId);
    console.log('Author == userId:', report.author == userId);
    console.log('User role is admin:', userRole === 'admin');

    // Check if user can delete this report
    if (report.author !== userId && userRole !== 'admin') {
      console.log('Authorization failed - user cannot delete this report');
      res.status(403).json({
        success: false,
        message: 'Not authorized to delete this report'
      } as ApiResponse);
      return;
    }
    
    console.log('Authorization passed - proceeding with deletion');

    // Delete associated media from Cloudinary
    if (report.media?.publicId) {
      await deleteFromCloudinary(report.media.publicId);
    }

    // Delete associated comments
    await Comment.deleteMany({ report: id });

    // Delete the report
    await DisasterReport.findByIdAndDelete(id);

    // Broadcast report deletion to all clients
    if (wsServer) {
      wsServer.broadcastReportDeletion(id);
      wsServer.broadcastAnalyticsUpdate(); // Broadcast analytics update
    }

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully'
    } as ApiResponse);
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

export const getUserReports = async (req: Request & { user?: IUser }, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      } as ApiResponse);
      return;
    }
    
    const userId = req.user._id.toString();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy as string || 'createdAt';
    const sortOrder = req.query.sortOrder as string || 'desc';
    const status = req.query.status as string;

    // Build filter object
    const filter: any = { author: userId };
    if (status) filter.status = status;

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const reports = await DisasterReport.find(filter)
      .populate('author', 'name email avatar')
      .populate('comments')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await DisasterReport.countDocuments(filter);

    // Calculate user stats
    const stats = await DisasterReport.aggregate([
      { $match: { author: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const userStats = {
      total: total,
      verified: stats.find(s => s._id === 'VERIFIED')?.count || 0,
      pending: stats.find(s => s._id === 'PENDING')?.count || 0,
      rejected: stats.find(s => s._id === 'REJECTED')?.count || 0
    };

    res.status(200).json({
      success: true,
      message: 'User reports retrieved successfully',
      data: reports,
      stats: userStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    } as ApiResponse);
  } catch (error) {
    console.error('Get user reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

export const voteReport = async (req: Request & { user?: IUser }, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { voteType } = req.body; // 'up' or 'down'
    
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      } as ApiResponse);
      return;
    }
    
    const userId = req.user._id.toString();

    const report = await DisasterReport.findById(id);
    if (!report) {
      res.status(404).json({
        success: false,
        message: 'Report not found'
      } as ApiResponse);
      return;
    }

    // Check if user already voted
    const hasVoted = report.votes.users.includes(userId);
    
    if (hasVoted) {
      res.status(400).json({
        success: false,
        message: 'You have already voted on this report'
      } as ApiResponse);
      return;
    }

    // Add vote
    report.votes.users.push(userId);
    if (voteType === 'up') {
      report.votes.up += 1;
    } else if (voteType === 'down') {
      report.votes.down += 1;
    }

    await report.save();

    // Create notification for report author
    await NotificationService.createReportVoteNotification(
      id,
      report.author,
      userId,
      req.user?.name || 'Someone',
      voteType
    );

    res.status(200).json({
      success: true,
      message: 'Vote recorded successfully',
      data: { votes: report.votes }
    } as ApiResponse);
  } catch (error) {
    console.error('Vote report error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};
