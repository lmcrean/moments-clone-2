// src/pages/messaging/Message.js

import React, { useEffect, useState } from "react";
import styles from "../../styles/Message.module.css";
import { useCurrentUser } from "../../contexts/CurrentUserContext";
import Card from "react-bootstrap/Card";
import Media from "react-bootstrap/Media";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { Link } from "react-router-dom";
import Avatar from "../../components/Avatar";
import { axiosRes } from "../../api/axiosDefaults";

const Message = (props) => {
  const {
    id,
    sender,
    sender_profile_image,
    content,
    date,
    time,
    setMessages,
  } = props;

  const currentUser = useCurrentUser();
  const [showFullTimestamp, setShowFullTimestamp] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newContent, setNewContent] = useState(content);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => [currentUser]);

  const is_sender = currentUser?.profile_id === sender;

  const handleDelete = async () => {
    try {
      await axiosRes.delete(`/messages/${id}/delete/`);
      setMessages((prevMessages) => ({
        ...prevMessages,
        results: prevMessages.results.filter((message) => message.id !== id),
      }));
      setShowDeleteModal(false);
    } catch (err) {
      console.error(err);
      setShowDeleteModal(false);
    }
  };

  const handleEdit = async () => {
    try {
      const { data } = await axiosRes.patch(`/messages/${id}/update/`, { content: newContent });
      setMessages((prevMessages) => ({
        ...prevMessages,
        results: prevMessages.results.map((message) =>
          message.id === id ? { ...message, content: data.content } : message
        ),
      }));
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMouseEnter = () => setShowFullTimestamp(true);
  const handleMouseLeave = () => setShowFullTimestamp(false);

  const handleShowDeleteModal = () => setShowDeleteModal(true);
  const handleCloseDeleteModal = () => setShowDeleteModal(false);

  return (
    <Card className={styles.Message}>
      <Card.Body>
        <Media className="align-items-center justify-content-between">
          <Link to={`/profiles/${sender}`}>
            <Avatar src={sender_profile_image} height={55} />
            {sender}
          </Link>
          <div className="d-flex align-items-center">
            <span
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {showFullTimestamp
                ? `${date} ${time}`
                : time}
            </span>
            {is_sender && (
              <>
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>Edit</Tooltip>}
                >
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    style={{ marginLeft: "10px" }}
                  >
                    Edit
                  </Button>
                </OverlayTrigger>
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>Delete</Tooltip>}
                >
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleShowDeleteModal}
                    style={{ marginLeft: "10px" }}
                  >
                    Delete
                  </Button>
                </OverlayTrigger>
              </>
            )}
          </div>
        </Media>
        {isEditing ? (
          <>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className={styles.EditTextarea}
            />
            <Button onClick={handleEdit} className="mt-2" variant="success" size="sm">
              Save
            </Button>
            <Button onClick={() => setIsEditing(false)} className="mt-2 ml-2" variant="secondary" size="sm">
              Cancel
            </Button>
          </>
        ) : (
          <Card.Text>{content}</Card.Text>
        )}

        {/* Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>Are you sure you want to delete this message?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseDeleteModal}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </Card.Body>
    </Card>
  );
};

export default Message;
