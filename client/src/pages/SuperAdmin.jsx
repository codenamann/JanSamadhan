import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Shield, 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  User,
  Mail,
  Building,
  Briefcase,
  Phone,
  Trash2,
  Edit
} from 'lucide-react';
import { toast } from 'sonner';
import LogoImage from '@/assets/JanSamadhan.png';
import Logo from '@/components/ui/logo';

const SuperAdmin = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    designation: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [authorities, setAuthorities] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const departments = [
    'Public Works',
    'Water Supply',
    'Electricity',
    'Sanitation',
    'Transportation',
    'Health',
    'Education',
    'Police',
    'Fire Department',
    'Municipal Corporation',
    'District Administration'
  ];

  const designations = [
    'Engineer',
    'Supervisor',
    'Manager',
    'Director',
    'Commissioner',
    'Deputy Commissioner',
    'Assistant Engineer',
    'Junior Engineer',
    'Inspector',
    'Officer',
    'Administrator'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.department) {
      setError('Department is required');
      return false;
    }
    if (!formData.designation) {
      setError('Designation is required');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'}/api/auth/authority/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(`Authority "${formData.name}" registered successfully!`);
        setFormData({
          name: '',
          email: '',
          department: '',
          designation: '',
          phone: ''
        });
        toast.success('Authority registered successfully');
        // Refresh authorities list
        fetchAuthorities();
      } else {
        setError(result.error || 'Failed to register authority');
        toast.error(result.error || 'Failed to register authority');
      }
    } catch (error) {
      console.error('Error registering authority:', error);
      setError('Failed to register authority. Please try again.');
      toast.error('Failed to register authority');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAuthorities = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'}/api/auth/authority/all`);
      const result = await response.json();
      
      if (result.success) {
        setAuthorities(result.data);
      }
    } catch (error) {
      console.error('Error fetching authorities:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this authority?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'}/api/auth/authority/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Authority deleted successfully');
        fetchAuthorities();
      } else {
        toast.error(result.error || 'Failed to delete authority');
      }
    } catch (error) {
      console.error('Error deleting authority:', error);
      toast.error('Failed to delete authority');
    }
  };

  const handleEdit = (authority) => {
    setFormData({
      name: authority.name,
      email: authority.email,
      department: authority.department,
      designation: authority.designation,
      phone: authority.phone
    });
    setEditingId(authority.id);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'}/api/auth/authority/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(`Authority "${formData.name}" updated successfully!`);
        setFormData({
          name: '',
          email: '',
          department: '',
          designation: '',
          phone: ''
        });
        setEditingId(null);
        toast.success('Authority updated successfully');
        fetchAuthorities();
      } else {
        setError(result.error || 'Failed to update authority');
        toast.error(result.error || 'Failed to update authority');
      }
    } catch (error) {
      console.error('Error updating authority:', error);
      setError('Failed to update authority. Please try again.');
      toast.error('Failed to update authority');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      name: '',
      email: '',
      department: '',
      designation: '',
      phone: ''
    });
    setEditingId(null);
    setError('');
    setSuccess('');
  };

  // Load authorities on component mount
  React.useEffect(() => {
    fetchAuthorities();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Logo link={LogoImage} alt="JanSamadhan" className="w-48 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Super Admin Panel</h1>
          <p className="text-gray-600">Manage Authority Accounts</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Add/Edit Authority Form */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
                {editingId ? 'Edit Authority' : 'Add New Authority'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert className="mb-4 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mb-4 border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={editingId ? handleUpdate : handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Full Name *
                  </Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address *
                  </Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="department" className="text-sm font-medium text-gray-700">
                    Department *
                  </Label>
                  <div className="relative mt-1">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                    <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="designation" className="text-sm font-medium text-gray-700">
                    Designation *
                  </Label>
                  <div className="relative mt-1">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                    <Select value={formData.designation} onValueChange={(value) => handleInputChange('designation', value)}>
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select designation" />
                      </SelectTrigger>
                      <SelectContent>
                        {designations.map((desig) => (
                          <SelectItem key={desig} value={desig}>
                            {desig}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Phone Number *
                  </Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {editingId ? 'Updating...' : 'Adding...'}
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        {editingId ? 'Update Authority' : 'Add Authority'}
                      </>
                    )}
                  </Button>
                  
                  {editingId && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Authorities List */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Registered Authorities
                </span>
                <Badge variant="secondary">
                  {authorities.length} total
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {authorities.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No authorities registered yet</p>
                    </div>
                  ) : (
                    authorities.map((authority) => (
                      <div key={authority.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-gray-900">{authority.name}</h3>
                              <Badge variant="outline" className="text-xs">
                                {authority.department}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Mail className="h-3 w-3" />
                                <span>{authority.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Briefcase className="h-3 w-3" />
                                <span>{authority.designation}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3" />
                                <span>{authority.phone}</span>
                              </div>
                            </div>
                            <div className="mt-2">
                              <Badge 
                                variant={authority.isActive ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {authority.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex gap-1 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(authority)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(authority.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Super Admin Panel - Authority Management System
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin;
