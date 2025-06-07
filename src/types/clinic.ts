export interface ClinicData {
  name: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  operatingHours?: string;
  profilePictureUrl?: string;
  coverPictureUrl?: string;
  address: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  images?: string[];
  status?: "ACTIVE" | "INACTIVE";
}
