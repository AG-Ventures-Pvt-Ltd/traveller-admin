import { api } from "@/common/constants/api.urls";
import { useGetData } from "@/services/useGetData";
import { containerBaseZIndexOffset } from "antd/es/_util/hooks";

export interface Booking {
    _id: string;
    fullName: string;
    tripName: string;
    hostName: string;
    numberOfPeople: number;
    status: string;
    createdAt: string;
    startDate: string;
    guestNames: string[];
}


 // Using DUMMY_BOOKINGS data directly now








