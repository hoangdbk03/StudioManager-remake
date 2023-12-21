import axios from 'axios';

const AxiosIntance = () => {
    const axiosIntance = axios.create({
        baseURL: 'https://api-gp-remake-production.up.railway.app/'
    });
    axiosIntance.interceptors.response.use(
        res => res.data,
        err => Promise.reject(err),
    );
    return axiosIntance;
}

export default AxiosIntance;