import { ModalCard, Button } from '@vkontakte/vkui';
import React from 'react';

export const ApproveModal = ({ onClose, removeQrCode, ...props }) => {
  const link = props.link.link || '';
  return (
    <ModalCard
      id={props.id}
      onClose={onClose}
      header="Подтвердите удаление"
      subheader={link}
      actions={
        <React.Fragment>
          <Button stretched mode="primary" onClick={onClose}>
            Отмена
          </Button>
          <Button stretched mode="destructive" onClick={removeQrCode}>
            Удалить
          </Button>
        </React.Fragment>
      }
    />
  );
};
