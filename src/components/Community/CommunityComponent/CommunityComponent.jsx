import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Switch,
  Card,
  Avatar,
  Typography,
  Button,
  Menu,
  Dropdown,
  List,
  Tooltip,
  Space,
  Divider
} from 'antd';
import {
  MoreOutlined,
  LikeOutlined,
  LikeFilled,
  CommentOutlined,
  ShareAltOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Text, Title } = Typography;

// Custom Comment Component
const CommentItem = ({ comment }) => (
  <div className="d-flex gap-3 mb-3">
    <Avatar src={comment.user_profile?.avatar} />
    <div className="flex-grow-1">
      <div className="bg-light p-3 rounded-3">
        <Text strong className="d-block mb-1">
          {comment.user_profile?.first_name} {comment.user_profile?.last_name}
        </Text>
        <Text>{comment.content}</Text>
      </div>
      <Text type="secondary" className="small mt-1 d-block">
        {new Date(comment.created_at).toLocaleString()}
      </Text>
    </div>
  </div>
);

const CommunitySettings = ({ community, onUpdate, show, onHide }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (community) {
      form.setFieldsValue({
        name: community.name || '',
        description: community.description || '',
        is_private: community.is_private || false
      });
    }
  }, [community, form]);

  const handleSubmit = (values) => {
    onUpdate(community.id, values);
    onHide();
  };

  return (
    <Modal
      title={<Title level={4}>Community Settings - {community?.name}</Title>}
      open={show}
      onCancel={onHide}
      footer={null}
      width={600}
      className="rounded-3 shadow"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-3"
      >
        <Form.Item
          name="name"
          label="Community Name"
          rules={[{ required: true, message: 'Please enter community name' }]}
        >
          <Input placeholder="Enter community name" className="rounded-2" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please enter description' }]}
        >
          <TextArea
            rows={4}
            placeholder="Enter community description"
            className="rounded-2"
          />
        </Form.Item>

        <Form.Item
          name="is_private"
          valuePropName="checked"
          className="mb-4"
        >
          <Space align="center">
            <Switch />
            <Text>Private Community</Text>
          </Space>
        </Form.Item>

        <div className="d-flex justify-content-end gap-2">
          <Button danger onClick={onHide}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit">
            Save Changes
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

const CommunityPost = ({
  post,
  onEdit,
  onDelete,
  onLike,
  onComment,
  isAdmin,
  currentUser
}) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);

  const handleEdit = () => {
    onEdit(post.id, editedContent);
    setIsEditing(false);
  };

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      onComment(post.id, newComment);
      setNewComment('');
    }
  };

  const canEdit = isAdmin || post.user.id === currentUser?.id;

  const menuItems = [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Edit',
      onClick: () => setIsEditing(true)
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Delete',
      danger: true,
      onClick: () => onDelete(post.id)
    }
  ];

  const PostActions = () => (
    <Space split={<Divider type="vertical" />}>
      <Button
        type="text"
        icon={post.is_liked ? <LikeFilled /> : <LikeOutlined />}
        onClick={() => onLike(post.id)}
        className={post.is_liked ? 'text-primary' : ''}
      >
        Like {post.like_count > 0 && `(${post.like_count})`}
      </Button>
      <Button
        type="text"
        icon={<CommentOutlined />}
        onClick={() => setShowComments(!showComments)}
      >
        Comment
      </Button>
      <Button type="text" icon={<ShareAltOutlined />}>
        Share
      </Button>
    </Space>
  );

  return (
    <Card className="mb-4 shadow-sm rounded-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Space>
          <Avatar src={post.user_profile.avatar} size={40} />
          <div>
            <Text strong>
              {post.user_profile.first_name} {post.user_profile.last_name}
            </Text>
            {post.community && (
              <Text type="secondary">
                {' → '}
                <Text type="primary">{post.community.name}</Text>
              </Text>
            )}
            <br />
            <Text type="secondary" className="small">
              {new Date(post.created_at).toLocaleString()}
            </Text>
          </div>
        </Space>

        {canEdit && (
          <Dropdown menu={{ items: menuItems }} placement="bottomRight">
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        )}
      </div>

      {isEditing ? (
        <div className="mb-3">
          <TextArea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            rows={4}
            className="mb-2 rounded-2"
          />
          <Space className="d-flex justify-content-end">
            <Button onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button type="primary" onClick={handleEdit}>
              Save Changes
            </Button>
          </Space>
        </div>
      ) : (
        <Text className="mb-3 d-block">{post.content}</Text>
      )}

      <Divider className="my-3" />
      <PostActions />

      {showComments && (
        <div className="mt-3">
          <List
            className="mb-3"
            itemLayout="vertical"
            dataSource={post.comments || []}
            locale={{ emptyText: 'No comments yet' }}
            renderItem={(comment) => (
              <CommentItem comment={comment} />
            )}
          />
          <div className="mt-3">
            <TextArea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              autoSize={{ minRows: 2, maxRows: 6 }}
              className="rounded-2"
            />
            <Button
              type="primary"
              onClick={handleCommentSubmit}
              disabled={!newComment.trim()}
              className="mt-2"
            >
              Post Comment
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export { CommunitySettings, CommunityPost };