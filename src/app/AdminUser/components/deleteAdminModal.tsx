import React from 'react';
import { Modal, message } from 'antd';
import { usePostData } from '../../../services/usePostData';
import { api } from '../../../common/constants/api.urls';
import { Admin } from '../constant';

interface DeleteAdminModalProps {
    setDeleteModal: React.Dispatch<React.SetStateAction<{ visible: boolean; user: Admin | null }>>;
    deleteModal: { visible: boolean; user: Admin | null };
    setAdmins: React.Dispatch<React.SetStateAction<Admin[]>>;
    onSuccess: () => void;
}

export const DeleteAdminModal: React.FC<DeleteAdminModalProps> = ({ setDeleteModal, deleteModal, onSuccess }) => {

    const { mutateAsync: deleteUser, error, isPending: isLoading } = usePostData<unknown, unknown>(
        `${api.deleteAdminUser}?id=${deleteModal?.user?._id}`,
        {
            onSuccess: () => {
                setDeleteModal({ visible: false, user: null });
                message.success('Admin deleted');
                onSuccess()
            },
            onError: (err: Error) => {
                message.error(err?.message || (error as Error)?.message || 'Failed to delete admin');
            }
        }
    );

    const handleDelete = async () => {
        try {
            await deleteUser({});
        } catch (err) {
            console.error('Delete admin error:', err);
        }
    };

    return (
        <Modal
            open={deleteModal.visible}
            title="Delete Admin"
            onCancel={() => setDeleteModal({ visible: false, user: null })}
            onOk={handleDelete}
            okText="Delete"
            okType="danger"
            cancelText="Cancel"
            okButtonProps={{ disabled: isLoading }}
        >
            {deleteModal.user && (
                <span>Are you sure you want to delete admin &quot;{deleteModal.user.username}&quot;?</span>
            )}
        </Modal>
    );
};
