import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {Button, DatePicker, Form, Input, message, Select, Upload} from "antd";
import {fetchCourseCatalog} from "../../../Redux/Slice/courseSlice";
import {UploadOutlined} from "@ant-design/icons";
import localServices from "../../../Services/localServices";
import moment from "moment";
import courseMangementService from "../../../Services/courseMangement.service";
import validator from "validator";

const {Option} = Select;

function EditCourse(props) {
    const [image, setImage] = useState()
    const dispatch = useDispatch()
    const {courseCatalog, editCourseData} = useSelector((state) => state.courseSlice)
    const [courseForm] = Form.useForm();
    const IMG_SIZE_LIMIT = 1048576 // 1MB

    const getFile = (e) => {
        setImage(e.file)
        return e.file
    };

    const initialValues = {
        ...editCourseData,
        ngayTao: moment(editCourseData.ngayTao, 'DD/MM/YYYY'),
        taiKhoanNguoiTao: editCourseData.nguoiTao.taiKhoan,
        maDanhMucKhoaHoc: editCourseData.danhMucKhoaHoc.maDanhMucKhoahoc,
    }

    useEffect(() => {
        dispatch(fetchCourseCatalog())
    }, []);

    const isChanged = (values) => {
        return !values.nguoiTao === editCourseData.nguoiTao.taiKhoan
            && !values.tenKhoaHoc === editCourseData.tenKhoaHoc
            && !values.moTa === editCourseData.moTa
            && !values.luotXem == editCourseData.luotXem
            && !values.maDanhMucKhoaHoc === editCourseData.danhMucKhoaHoc.maDanhMucKhoaHoc
            && !values.biDanh === editCourseData.biDanh;
    }

    const onFinish = (values) => {
        const maNhomLocal = localServices.getGroupID()
        let newValues = {
            ...values,
            ngayTao: moment(values.ngayTao).format('DD/MM/YYYY'),
            hinhAnh: image?.name,
            maNhom: maNhomLocal,
            danhGia: values.danhGia * 1,
        }

        !isChanged(newValues)?
            courseMangementService.editCourse(newValues)
                .then((res) => {
                    !image ? message.success('S???a kh??a h???c th??nh c??ng') : handleUpdateImage(image, res.data.tenKhoaHoc)
                })
                .catch((err) => {
                    message.error(err.err.response.data)
                })
            : message.warning('B???n c???n thay ?????i ??t nh???t m???t th??ng tin!')
    };

    const handleUpdateImage = (img, tenKhoaHoc) => {
        let frm = new FormData();
        frm.append('file', img)
        frm.append('tenKhoaHoc', tenKhoaHoc)
        courseMangementService.uploadImage(frm)
            .then((res) => {
                message.success('S???a kh??a h???c th??nh c??ng')
                window.location.reload(false);
            })
            .catch((err) => {
                message.warn(`S???a th??ng tin kh??a h???c th??nh c??ng nh??ng ${err.err.response.data}, vui l??ng th??? l???i sau!`)
            })
    }

    const renderCourseCatalogOption = () => {
        return courseCatalog?.map((item, key) => {
            return (<Option key={key} value={item.maDanhMuc}>{item.tenDanhMuc}</Option>)
        })
    }

    return (<Form name="add_course"
                  form={courseForm}
                  labelCol={{span: 24}}
                  initialValues={initialValues}
                  wrapperCol={{span: 24}}
                  onFinish={onFinish}>
        <h1 className='text-center text-3xl mb-6'>S???a kh??a h???c</h1>
        <div className='grid grid-cols-2 gap-6'>
            <div className='col-span-1'>
                <Form.Item
                    label="M?? kh??a h???c"
                    name="maKhoaHoc"
                    rules={[{required: true, message: 'Kh??ng ???????c ????? tr???ng!'}]}
                >
                    <Input/>
                </Form.Item>

                <Form.Item
                    label="T??n kh??a h???c"
                    name="tenKhoaHoc"
                    rules={[{required: true, message: 'Kh??ng ???????c ????? tr???ng!'}]}
                >
                    <Input/>
                </Form.Item>

                <Form.Item
                    label="Danh m???c kh??a h???c"
                    name="maDanhMucKhoaHoc"
                    rules={[{required: true, message: 'Kh??ng ???????c ????? tr???ng!'}]}
                >
                    <Select defaultValue={editCourseData.danhMucKhoaHoc.maDanhMucKhoaHoc}
                            placeholder="Ch???n danh m???c">
                        {renderCourseCatalogOption()}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Ng??y t???o"
                    name="ngayTao"
                    rules={[{required: true, message: 'Kh??ng ???????c ????? tr???ng!'}]}
                >
                    <DatePicker placeholder='Ch???n ng??y t???o' format='DD/MM/YYYY'/>
                </Form.Item>
            </div>
            <div className='col-span-1'>
                <Form.Item
                    label="????nh gi??"
                    name="danhGia"
                    rules={[{required: true, message: 'Kh??ng ???????c ????? tr???ng!'},
                        {
                            validator: (rule, value) => {
                                return validator.isNumeric(value)?
                                    Promise.resolve():
                                    Promise.reject('????nh gi?? ph???i l?? s???')
                            },message: '????nh gi?? ph???i l?? s???!'
                        },
                    ]}
                >
                    <Input/>
                </Form.Item>

                <Form.Item
                    label="L?????t xem"
                    name="luotXem"
                    rules={[{required: true, message: 'Kh??ng ???????c ????? tr???ng!'},
                        {validator: (rule, value) => {
                                return validator.isNumeric(value)?
                                    Promise.resolve():
                                    Promise.reject('L?????t xem ph???i l?? s???')
                            },message: 'L?????t xem ph???i l?? s???!'}]}
                >
                    <Input/>
                </Form.Item>

                <Form.Item
                    label="Ng?????i t???o"
                    name="taiKhoanNguoiTao"
                    rules={[{required: true, message: 'Kh??ng ???????c ????? tr???ng!'}]}
                >
                    <Input/>
                </Form.Item>

                <Form.Item
                    label="H??nh ???nh"
                    name="hinhAnh"
                    rules={[
                        {required: true, message: 'Kh??ng ???????c ????? tr???ng!'},
                        {
                            validator: (rule, value) => {
                                return (value == editCourseData.hinhAnh)?
                                    Promise.reject('Kh??ng ???????c ????? tr???ng!'):
                                    Promise.resolve()
                            }, message: 'Kh??ng ???????c ????? tr???ng!'
                        },
                        {validator:(_,value) => {
                            return (value.size > IMG_SIZE_LIMIT) ?
                                Promise.reject('H??nh ???nh ph???i nh??? h??n 1MB') :
                                Promise.resolve()
                        }, message: 'K??ch th?????c h??nh ???nh kh??ng ???????c l???n h??n 1MB'}
                    ]}
                    getValueFromEvent={getFile}
                >
                    <Upload
                        accept={'image/*'}
                        beforeUpload={() => {
                        return false
                    }}
                            listType="picture"
                            maxCount={1}
                            defaultFileList={[{
                                uid: '-1',
                                name: 'H??nh ???nh hi???n t???i',
                                status: 'done',
                                url: editCourseData.hinhAnh
                            }]}
                    >
                        <Button icon={<UploadOutlined/>}>Ch???n h??nh ???nh</Button>
                    </Upload>
                </Form.Item>
            </div>
        </div>

        <Form.Item
            label="M?? t???"
            name="moTa"
            rules={[{required: true, message: 'Kh??ng ???????c ????? tr???ng!'}]}
        >
            <Input/>
        </Form.Item>

        <Form.Item
            label="B?? danh"
            name="biDanh"
            rules={[{required: true, message: 'Kh??ng ???????c ????? tr???ng!'}]}
        >
            <Input/>
        </Form.Item>

        <Form.Item>
            <Button type="primary" shape="round" htmlType="submit">C???p nh???p</Button>
        </Form.Item>
    </Form>);
}

export default EditCourse;