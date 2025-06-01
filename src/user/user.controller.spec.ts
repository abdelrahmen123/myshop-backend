import { UpdateUserDto } from './dto/update-user.dto';
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController, UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SafeUserType } from 'src/auth/types/auth.types';

type UserTestType = {
  name: string;
  email: string;
  password: string;
  role: string;
  id: string;
};

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  const createUserDto: CreateUserDto = {
    name: 'name',
    email: 'email',
    password: 'password',
    role: 'USER',
  };

  const user: UserTestType = {
    ...createUserDto,
    id: '1',
  };

  const users: UserTestType[] = [
    { id: '1', ...createUserDto },
    { id: '2', ...createUserDto },
    { id: '3', ...createUserDto },
    { id: '4', ...createUserDto },
  ];

  const updateUserDto: UpdateUserDto = {
    name: 'new name',
  };

  const updatedUser: UserTestType = {
    ...user,
    ...updateUserDto,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            create: jest.fn(() => Promise.resolve(user)),
            findAll: jest.fn(() => Promise.resolve(users)),
            findOne: jest.fn(() => Promise.resolve(user)),
            update: jest.fn(() => Promise.resolve(updatedUser)),
            remove: jest.fn(() => Promise.resolve()),
          },
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('UserController should be defined', () => {
    expect(userController).toBeDefined();
  });

  it('UserService should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('create()', () => {
    it("should call userService's create method", async () => {
      await userController.create(createUserDto);

      expect(userService.create).toHaveBeenCalledWith(createUserDto);
      expect(userService.create).toHaveBeenCalledTimes(1);
    });

    it('should return created user', async () => {
      const result = await userController.create(createUserDto);

      expect(result).toMatchObject(user);
    });
  });

  describe('findAll()', () => {
    it("should call userService's findAll method", async () => {
      await userController.findAll();

      expect(userService.findAll).toHaveBeenCalled();
      expect(userService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return all users', async () => {
      const result = await userController.findAll();

      expect(result).toEqual(users);
    });
  });

  describe('findOne()', () => {
    it('should call userService.findOne()', async () => {
      const result = await userController.findOne('1');

      expect(userService.findOne).toHaveBeenCalledWith('1');
      expect(userService.findOne).toHaveBeenCalledTimes(1);

      expect(result).toMatchObject(user);
    });
  });

  describe('update()', () => {
    it('should call userService.update()', async () => {
      const result = await userController.update('1', updateUserDto);

      expect(userService.update).toHaveBeenCalledWith('1', updateUserDto);
      expect(userService.update).toHaveBeenCalledTimes(1);

      expect(result).toMatchObject(updatedUser);
    });
  });

  describe('remove()', () => {
    it('should call userService.remove()', async () => {
      const result = await userController.remove('1');

      expect(userService.remove).toHaveBeenCalledWith('1');
      expect(userService.remove).toHaveBeenCalledTimes(1);

      expect(result).toBeUndefined();
    });
  });
});

describe('ProfileController', () => {
  let profileController: ProfileController;
  let userService: UserService;

  const user: SafeUserType = {
    name: 'name',
    id: '1',
    email: 'email@gmail.com',
    role: 'USER',
    image: null,
    phone: null,
    address: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const updateUserDto: UpdateUserDto = {
    name: 'new name',
  };

  const updatedUser: SafeUserType = {
    ...user,
    ...updateUserDto,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findOne: jest.fn(() => Promise.resolve(user)),
            update: jest.fn(() => Promise.resolve(updatedUser)),
            remove: jest.fn(() => Promise.resolve()),
          },
        },
      ],
    }).compile();

    profileController = module.get<ProfileController>(ProfileController);
    userService = module.get<UserService>(UserService);
  });

  it('UserController should be defined', () => {
    expect(profileController).toBeDefined();
  });

  it('UserService should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('findOne()', () => {
    it('should call userService.findOne()', async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const result = await profileController.findProfile({ user });

      expect(userService.findOne).toHaveBeenCalledWith('1');
      expect(userService.findOne).toHaveBeenCalledTimes(1);

      expect(result).toMatchObject(user);
    });
  });

  describe('update()', () => {
    it('should call userService.update()', async () => {
      const result = await profileController.updateProfile(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        { user },
        updateUserDto,
      );

      expect(userService.update).toHaveBeenCalledWith('1', updateUserDto);
      expect(userService.update).toHaveBeenCalledTimes(1);

      expect(result).toMatchObject(updatedUser);
    });
  });

  describe('remove()', () => {
    it('should call userService.remove()', async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const result = await profileController.removeProfile({ user });

      expect(userService.remove).toHaveBeenCalledWith('1');
      expect(userService.remove).toHaveBeenCalledTimes(1);

      expect(result).toBeUndefined();
    });
  });
});
